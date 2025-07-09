# Advanced recipes

- [Asynchronously initialized components](#asynchronously-initialized-components)
- [Asynchronous request batching and caching](#asynchronous-request-batching-and-caching)
- [Cancelling asynchronous operations](#cancelling-asynchronous-operations)
- [Event loop in NodeJS](#event-loop-in-nodejs)
- [CPU bound tasks](#cpu-bound-tasks)

## Asynchronously initialized components

- Let’s say we have a DB class

  ```jsx
  import EventEmitter from "node:events";

  class DB extends EventEmitter {
    connected = false;

    connect() {
      setTimeout(() => {
        this.connected = true;
        this.emit("connect");
      }, 1000);
    }

    async query(queryString: string) {
      if (!this.connected) {
        throw new Error("Not connected to DB yet");
      }

      console.log("Query executed: ", queryString);
    }
  }

  export const db = new DB();
  ```

Database requires connection before executing any queries, so the startup of the program cannot be synchronous, we need until database client is connected to the database. In this case, there are 2 ways we can follow to execute queries.

- First way is wait until the connection is established before executing any query.
  Another variance is to wait for connected event inside asynchronous method of the component.

  ```jsx
  import { once } from "node:events";
  import { db } from "./db";

  db.connect();

  const getUsers = async () => {
    await once(db, "connected");

    return db.query("GET * from users");
  };

  getUsers();
  ```

- Second way is to delay execution of program until connection is established.
  If there are multiple async component, we might need to wait a long time before executing our program. And it might separate the code dependent on async component from non-dependent ones, making our code ugly.

  ```jsx
  import { once } from "node:events";
  import { db } from "./db";

  db.connect();

  once(db, "connected").then(() => {
    db.query("GET * from users");

    // ... rest of program
  });
  ```

The better approach is to use pre-initialization queues with Command pattern.

In this approach we delay the execution of queries, and execute them once connection is established.

- This MIGHT (and might not) be better than listening for connected event inside query method
  Because it might create a lot of listeners for the same event, if many of queries are invoked.

  ```jsx
  import EventEmitter, { once } from "node:events";

  class DB extends EventEmitter {
    connected = false;
    queryQueue: any[] = [];

    async connect() {
      setTimeout(() => {
        this.connected = true;
        this.emit("connect");
      }, 1000);
    }

    async query(queryString: string) {
      if (!this.connected) {
        await once(this, "connected");
      }

      console.log("Query executed: ", queryString);
    }
  }

  export const db = new DB();
  ```

```jsx
import EventEmitter from "node:events";

class DB extends EventEmitter {
  connected = false;
  queryQueue: any[] = [];

  async connect() {
    setTimeout(() => {
      this.connected = true;
      this.emit("connect");
      this.queryQueue.forEach((queryFn) => queryFn());
      this.queryQueue = [];
    }, 1000);
  }

  async query(queryString: string) {
    if (!this.connected) {
      return new Promise((resolve, reject) => {
        const command = () => this.query(queryString).then(resolve, reject);

        this.queryQueue.push(command);
      });
    }

    console.log("Query executed: ", queryString);
  }
}

export const db = new DB();
```

- It’s also possible to further improve our code using State pattern
  We can see that we created class (InitializedState) purely for business logic, free from preinitializing queue boilerplate.

  ```jsx
  import EventEmitter from "node:events";

  const METHODS_REQUIRING_CONNECTION = ["query"];
  const deactivate = Symbol("deactivate");

  class PendingState {
    queryQueue: any[] = [];

    constructor(db: DB) {
      METHODS_REQUIRING_CONNECTION.forEach((method) => {
        this[method] = (...args: any) => {
          return new Promise((resolve, reject) => {
            const command = () => {
              db[method](...args).then(resolve, reject);
            };
            this.queryQueue.push(command);
          });
        };
      });
    }

    [deactivate]() {
      this.queryQueue.forEach((query) => query());
      this.queryQueue = [];
    }
  }

  class InitializedState {
    async query(queryString: string) {
      console.log("Query executed: ", queryString);
    }
  }

  class DB extends EventEmitter {
    state: any = null;
    connected = false;

    constructor() {
      super();
      this.state = new PendingState(this);
    }

    async query(queryString: string) {
      return this.state.query(queryString);
    }

    connect() {
      setTimeout(() => {
        this.connected = true;
        this.emit("connected");

        this.state[deactivate]();
        this.state = new InitializedState();
      }, 1000);
    }
  }
  ```

The approach of pre-initialization queue is used in [Mongoose](https://github.com/Automattic/mongoose/blob/321995d769ff085aa0a4553b2befb012eb2c11c8/lib/drivers/node-mongodb-native/collection.js#L141) and [Pg](https://github.com/brianc/node-postgres/blob/2013d77b28be5a0d563addb1852eb97e9693e452/packages/pg/lib/client.js#L549) packages.

## Asynchronous request batching and caching

Caching is involved in many applications. Consider a case when a request is made to the server, async operation happen. When multiple identical requests are made, async operation executes multiple times.

![Request flow](./assets/simple-request-flow.png)

Request batching refers to appending identical request to clients queue, executing async operation only once, and notify all the clients with the result.

![Request batching](./assets/request-batching.png)

Assuming content doesn’t change so often, request batching might not be effective if async operation is fast, or when clients send request in a long time distance from each other. In such cases, caching comes into scene.

Request batching is effective in high-load applications with slow APIs.

There are many types of caching, but the idea is same. We cache a result, and return it. If multiple identical requests are made, cache is set multiple times. The idea is to batch requests until the cache is set up, set the cache only once, and serve cached result when it’s done. Note to asynchronously return cached result to prevent Zalgo, even if the operation is synchronous.

![Request batching caching](./assets/request-batching-caching.png)

- The source code with example program utilizing request batching and caching, with load testing and db population scripts
  [ts.zip](./assets/ts.zip)

## Cancelling asynchronous operations

Note that this is not about cancelling promises, it’s about cancelling underlying asynchronous operation. In fact, Promise/A+ spec doesn’t define any way to cancel a promise.

- Basic recipe is to check whether a specific value is set to true, and then throw an error

  ```jsx
  async function cancellable(params) {
    if (params.isCancelled) {
      throw new CancelError();
    }

    await wait(1000);

    if (params.isCancelled) {
      throw new CancelError();
    }

    await wait(1000);
  }
  ```

- Another slightly better approach is to user cancellable wrapper
  Note that we return a promise in order to prevent Zalgo problem.

  ```jsx
  function createCancellableWrapper() {
    let isCancelled = false;

    const cancel = () => {
      isCancelled = true;
    };

    const cancelableWrapper = (func, ...args) => {
      if (isCancelled) {
        return Promise.reject(new CancelError());
      }

      return func(...args);
    };

    return { cancelableWrapper, cancel };
  }

  async function cancellable(cancellableWrapper) {
    await cancellableWrapper(wait, 1000);
    await cancellableWrapper(wait, 1000);
  }

  const { cancelableWrapper, cancel } = createCancellableWrapper();

  cancellable(cancelableWrapper).catch((err) => {
    if (err instanceof CancelError) {
      console.log("Operation cancelled");
    }
  });

  setTimeout(() => {
    cancel();
  }, 1000);
  ```

- The most complicated but rewarding approach is with using generators
  We can see that `await` is replaced with `yield`, and there is no cancellation logic in the body of the function. It’s also interesting that cancellable returns a promise, which can be used to inspect the result of asynchronous operation.
  The function that is passed to factory function is called supervised function.

  ```jsx
  function createCancellable(generatorFn) {
    return (...args) => {
      const generator = generatorFn(...args);
      let isCancelRequested = false;

      const cancel = () => {
        isCancelRequested = true;
      };

      const promise = new Promise((resolve, reject) => {
        const nextStep = async (prevValue) => {
          if (isCancelRequested) {
            throw new CancelError();
          }

          if (prevValue.done) {
            return resolve(prevValue.value);
          }

          try {
            nextStep(generator.next(await prevValue.value));
          } catch (error) {
            try {
              nextStep(generator.throw(error));
            } catch (err) {
              reject(err);
            }
          }
        };

        nextStep({});
      });

      return { promise, cancel };
    };
  }

  const cancellable = createCancellable(function* () {
    yield wait(1000);
    yield wait(1000);
    yield wait(1000);
  });

  const { promise, cancel } = cancellable();

  promise.catch((err) => {
    if (err instanceof CancelError) {
      console.log("Operation cancelled");
    }
  });

  setTimeout(() => {
    cancel();
  }, 1000);
  ```

## Event loop in NodeJS

Not from book. Just observed that event loop works differently in NodeJS. While in browser event loop checks for microtask and macrotask queues, in NodeJS there are many other queues to be checked. They include (in order of execution):

1. Timers (setTimeout or setInterval)
2. Pending callbacks. I/O callbacks that were deferred to the next loop iteration, mostly low-level callbacks from C++ layer or libuv, such as TCP socket errors.
3. Idle, Prepare. Internal phase for NodeJS, isn’t interacted directly.
4. Poll. Main phase for I/O. Here I/O callbacks are executed. The queue is not fully emptied if there is callback ready to be fired in the next phase.
5. Check. Executes setImmediate function callback.
6. Close. Callbacks of resources to be closed, like socket.destroy(), process.exit(), socket.end().

Now, there is also microtask queue, it’s not separate phase. This queue includes callbacks from `process.nextTick()` and promise callbacks. This queue is emptied before and after each phase. Callback scheduled with `process.nextTick()` take priority over other microtask callbacks.

If microtask queue callbacks re-fills itself (for example `process.nextTick()` scheduling another `process.nextTick()` callback), it causes I/O starvation.

Just reminder, event loop queues are checked only when callstack is empty.

### CPU bound task

Image a program that takes a set of numbers, and desired sum. It combines all possibles combinations of elements, and if the sum of them is equal to given sum, it outputs it. This program would have O(2^N) time complexity. This task would be synchronous, and it would be heavy on CPU utilization rather than processing I/O.

- Program code
  Here we create a server that takes the search params as input. If the pathname is not “/subsetSum”, it immediately replies. This is needed to check if server can process requests asynchronously.
  If not, it starts processing subsets, and write to socket when there is a match.

  ```jsx
  // server.js
  import { createServer } from "http";
  import { SubsetSum } from "./subsetSum.js";

  createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    if (url.pathname !== "/subsetSum") {
      res.writeHead(200);
      return res.end("I'm alive!\n");
    }

    const data = JSON.parse(url.searchParams.get("data"));
    const sum = JSON.parse(url.searchParams.get("sum"));
    res.writeHead(200);
    const subsetSum = new SubsetSum(sum, data);
    subsetSum.on("match", (match) => {
      res.write(`Match: ${JSON.stringify(match)}\n`);
    });
    subsetSum.on("end", () => res.end("ended"));
    subsetSum.start();
  }).listen(8000, () => console.log("Server started"));
  ```

  Here we process all possible subsets, and emit match event on match, and end event when completed processing.

  ```jsx
  // subsetSum.js
  import { EventEmitter } from "events";

  export class SubsetSum extends EventEmitter {
    constructor(sum, set) {
      super();
      this.sum = sum;
      this.set = set;
      this.totalSubsets = 0;
    }

    _combine(set, subset) {
      for (let i = 0; i < set.length; i++) {
        const newSubset = subset.concat(set[i]);
        this._combine(set.slice(i + 1), newSubset);
        this._processSubset(newSubset);
      }
    }

    _processSubset(subset) {
      console.log("Subset", ++this.totalSubsets, subset);
      const res = subset.reduce((prev, item) => prev + item, 0);
      if (res === this.sum) {
        this.emit("match", subset);
      }
    }

    start() {
      this._combine(this.set, []);
      this.emit("end");
    }
  }
  ```

If we start the server, give it a set of 30 elements, it takes a while to process. Meanwhile, if we send another request to another pathname, it doesn’t reply, our server hangs, because it is synchronously processing the first request.

### Interleaving approach

Well, optimization needed. We can to yield (give control) to the main thread. Every synchronous task consists of steps. We can yield to the main thread after each step in order to let it process pending I/O. This can be done with `setImmediate` (though it’s highly discouraged from MDN).

- Program code
  The code has changed, we now store the number of running operations of processing subsets, because the processing is asynchronous now. Combination of subset is now defined as a step, and we schedule this callback with `setImmediate`, which would run after any I/O in event loop phases.

  ```jsx
  // subsetSumDefer.js

  import { EventEmitter } from "events";

  export class SubsetSum extends EventEmitter {
    constructor(sum, set) {
      super();
      this.sum = sum;
      this.set = set;
      this.totalSubsets = 0;
    }

    _combineInterleaved(set, subset) {
      this.runningCombine++;
      setImmediate(() => {
        this._combine(set, subset);
        if (--this.runningCombine === 0) {
          this.emit("end");
        }
      });
    }

    _combine(set, subset) {
      for (let i = 0; i < set.length; i++) {
        const newSubset = subset.concat(set[i]);
        this._combineInterleaved(set.slice(i + 1), newSubset);
        this._processSubset(newSubset);
      }
    }

    _processSubset(subset) {
      console.log("Subset", ++this.totalSubsets, subset);
      const res = subset.reduce((prev, item) => prev + item, 0);
      if (res === this.sum) {
        this.emit("match", subset);
      }
    }

    start() {
      this.runningCombine = 0;
      this._combineInterleaved(this.set, []);
    }
  }
  ```

Now, when we request another pathname while server is processing subsets, we get a response. This approach is not ideal, because delaying execution of step, multiplied to the number of steps, might cause huge delays in processing time. Also, if the step takes too long to process, this approach is inefficient.

Also note that scheduling the next step with `process.nextTick()` would cause the pending I/O to starve, because its callback is added to the microtask queue as prioritized task. This queue is drained before and after each phase, including poll phase.

### Multi-process approach

- NodeJS child processes
  Child processes are created with `spawn` function from `child_process` module. It behaves like `popen` (uses fork internally) in standard C library, but with more abilities. It pipes readable streams to stdout and stderr, and writable stream to stdin.
  As we know, pipes use buffers internally, which is written into and read from. This buffer size depends on OS, but when it fills up, process writing to the buffer blocks, until reader reads and free ups the space. We can pass option of `stdio` to `spawn`, and specify it as `ignore`, which causes all output to be written to `/dev/null`
  There are other alternatives to `spawn` for different behavior, built on top of `spawn`.

Another way to optimize our program is to use another processes. NodeJS is the best when dealing with I/O, and it’s asynchronous nature makes it great for such tasks. But synchronous operations can block I/O, so we can leave sync work to another processes. This lets the program to run at its full capacity, and we don’t need refactoring as in interleaving approach.

This approach also has no performance penalty, compared to interleaving approach. We can also take advantage of multi-core architectures in our machines.

First of all we implement process pool. It creates given max number of processes when requested, and keep them alive. When requested to release the process, it is queued to the waiting list, until next time it’s requested. We communicate through built-in interface provided by `fork` function. If we have our child processes made with other languages and compiled, we can create our own interface for communication.

Next we implement a worker, that synchronously executes subset sum and sends the result to the parent process when matched, and sends `end` event when completed.

After that we implement SubsetSumFork class, that utilizes the process pool and worker. It has the same interface as our old SubsetSum class.

When we run our server and make requests to it with large subset, and when computing make another request to another route, we can see that the route is alive.

- Program

  ```jsx
  // processPool.js
  import { fork } from "node:child_process";

  export class ProcessPool {
    active = [];
    waiting = [];
    pool = [];
    file = "";
    maxPool = 0;

    constructor(file, maxPool) {
      this.file = file;
      this.maxPool = maxPool;
    }

    acquire() {
      return new Promise((resolve, reject) => {
        if (this.pool.length > 0) {
          const worker = this.pool.pop();
          this.active.push(worker);
          resolve(worker);
          return;
        }

        if (this.active.length >= this.maxPool) {
          this.waiting.push({ resolve, reject });
          return;
        }

        const worker = fork(this.file);

        worker.once("message", (message) => {
          if (message === "ready") {
            this.active.push(worker);
            resolve(worker);
            return;
          }

          worker.kill();
          reject(new Error("Worker unexpectedly exited"));
        });

        worker.once("exit", (code) => {
          console.log("Process exited with code", code);
          this.active = this.active.filter((w) => w !== worker);
          this.pool = this.pool.filter((w) => w !== worker);
        });
      });
    }

    release(worker) {
      if (this.waiting.length > 0) {
        const { resolve } = this.waiting.pop();
        resolve(worker);
        return;
      }

      this.active = this.active.filter((w) => w !== worker);
      this.pool = this.pool.filter((w) => w !== worker);
    }
  }

  // workers/worker.js
  import { SubsetSum } from "../subsetSum.js";

  process.on("message", (message) => {
    const { sum, set } = message;
    const subset = new SubsetSum(sum, set);

    subset.on("match", (matchedSubset) => {
      process.send({ event: "match", data: matchedSubset });
    });

    subset.on("end", () => {
      process.send({ event: "end" });
    });

    subset.start();
  });

  process.send("ready");

  // subsetSumFork.js
  import EventEmitter from "node:events";
  import { ProcessPool } from "./processPool.js";

  const processPool = new ProcessPool("./workers/worker.js", 2);

  export class SubsetSumFork extends EventEmitter {
    sum = 0;
    set = [];

    constructor(sum, set) {
      super();
      this.sum = sum;
      this.set = set;
    }

    async start() {
      const worker = await processPool.acquire();
      worker.send({ sum: this.sum, set: this.set });

      const handleMessage = (message) => {
        if (message.event === "end") {
          processPool.release(worker);
          worker.removeListener("message", handleMessage);
        }

        this.emit(message.event, message.data);
      };

      worker.on("message", handleMessage);
    }
  }
  ```
