# Chapter 12: Scalability and Architectural Patterns

## Table of contents

- [Cluster](#cluster)
- [Stateful communications](#stateful-communications)
- [Reverse proxy](#reverse-proxy)

When JavaScript was created, it was perfect for distributed systems because of its non-blocking behavior. Ranging from a few nodes to thousands, communicating with each other over the network.

NodeJS is single-threaded, so it might not utilize all the capacity of multi-core machine, but this is one side of coin. In reality, scalability doesn’t only refer to increasing capacity of machine and handling more requests faster, but also high availability, and fault-tolerance. Breaking the code in multiple components can also be considered as scalability strategy in terms of development.

Because NodeJS is single-threaded, the only way to scale it is to distribute it over multiple instances and machines. But with this, we also get higher availability and fault tolerance of the application.

When talking about scalability, the first principle is about three dimensions scaling.

1. X dimension - cloning the application. It’s the easiest one. It’s about cloning the application into N processes and machines, and letting each instance handle 1/Nth of the workload.
2. Y dimension - decomposing by functionality, breaking it into multiple components based on functionality. These components are standalone application codebases, possibly with their own databases, functionality, and even UI. For example, having a monolith application, this means breaking it into microservices, each with its set of functionalities. For example, making separate server for auth operations, or making internal product management vs product management for clients.
3. Z dimension - splitting by data partition. This is mostly about databases, also known as horizontal/vertical partitioning. When there is too much data, such database might be limited (disk/memory limit, high I/O), so data partitioning can be used, which would for example separate users database into users with common starting letter of name (range partitioning), or hash of the user (hash partitioning), or country of the user (list partitioning). Each instance of application uses specific database partition.
   Application partitioning can also be done, but there are few use cases for these. For example when using databases that don’t support data partitioning, or making applications at Google scale.
   Z-scaling is very complex, so should be considered only after X and Y axes are fully exploited.

In NodeJS, applications are scaled sooner compared to others, NodeJS is single-threaded. But it’s not disadvantage, because scaling is not only about resources and computing power, but also about fault-tolerance and high availability. Also, this makes NodeJS developers to consider scalability in early stages of development, for example not using process memory, and share common information among the processes (let’s say user session) in database.

## Cluster

Simple pattern in NodeJS for scaling the application is `cluster` native module. It lets us define the master process, and spawn worker processes. Master process distributes the load into the worker processes with Round-Robin algorithm, but a little smarter. It’s default scheduling algorithm in all OSs except Windows. In Windows it should be assigned explicitly.

![Cluster module](./assets/cluster.png)

When we use `cluster` module, `server.listen` from worker process is delegated to the master process. This delegation is simple, but sometimes it might not behave how we might expect:

1. When using specific file descriptor to listen (`server.listen({fd: 14})`). In this case, because file descriptors table differ for each process. When we listen with file descriptor in worker process, the master process doesn’t have same FD number (which is basically index in FD table) mapped to the same file. To overcome this, we can create file descriptor in master and pass to worker. This way worker uses FD which is known for master. (Side note: it’s possible that in worker process, the FD table entry is created, but underlying kernel object is same, though index might differ).
2. `server.listen(handle)` prevents the worker from delegating this to parent.
3. `server.listen(0)` causes server to listen on random port every time. The difference when using master process is first port is random, but next ones are incremented.

- We can create simple http server and make a load balancing with `autocannon` package.
  200 concurrent connections for 10 seconds resulted in average of 350ms.

  ```jsx
  const server = http.createServer((req, res) => {
    for (let i = 0; i < 1e7; i++) {}

    res.end(`Hello from worker: ${pid}`);
  });

  server.listen(8000, () => {
    console.log("Started server with pid", pid);
  });
  ```

- And with `cluster` module.
  200 concurrent connections for 10 seconds resulted in average of 50ms of response time. Mac M3 Pro, 12 cores.
  In this code, when we `cluster.fork`, the same module is re-run as a separate process, but in worker mode, with `cluster.isWorker` set to `true`. Note that separate process has its own event loop, memory, and modules loaded. `cluster.fork` uses `child_process.fork()` under the hood, so it’s possible to communicate with worker process via communication channel.

  ```jsx
  import cluster from "cluster";
  import { cpus } from "os";
  import http from "http";

  const { pid } = process;

  if (cluster.isPrimary) {
    const cpusNumber = cpus().length;

    console.log("Clustering to CPUs:", cpusNumber);

    for (let i = 0; i < cpusNumber; i++) {
      cluster.fork();
    }
  } else {
    const server = http.createServer((req, res) => {
      for (let i = 0; i < 1e7; i++) {}

      res.end(`Hello from worker: ${pid}`);
    });

    server.listen(8000, () => {
      console.log("Started server with pid", pid);
    });
  }
  ```

Consider a case when our application crashes for whatever reason. In this case, if we have just one process serving requests, and some tools like `pm2` to monitor our process and restart in the case of crash, we still have some window gap, where application is not available.

Scalability is also about high-availability. The property of keeping certain level of service even after crashes is known as **resiliency**. It contributes to high-availability.

- We can achieve it with `cluster` module.
  In this case, in the master process we listen for `exit` event from `cluster` module, which is fired when worker exits. By checking certain properties, we can ensure that it exited because of the error. When so, we fork another worker process.
  When making 200 concurrent requests for 10s, there was 34k requests, and only 1k failed. This is 97% availability.

  ```jsx
  import cluster from "cluster";
  import { cpus } from "os";
  import http from "http";

  const { pid } = process;

  if (cluster.isPrimary) {
    cluster.on("exit", (worker, code) => {
      if (code !== 0 && !worker.exitedAfterDisconnect) {
        console.log(
          `Worker with pid ${worker.process.pid} crashed,
           starting a new worker`
        );
        cluster.fork();
      }
    });

    // ...
  } else {
    setTimeout(() => {
      throw new Error("crash");
    }, Math.ceil(Math.random() * 3) * 1000);

    // ...
  }
  ```

Sometimes we want to update our application and deploy to server. In this case, there is still small window gap when our service is not available.

- We can use `cluster` module to make `zero-downtime` restarts.
  In this case, we restart the workers one by one. We first disconnect and wait for exit event, spawn another worker and wait when it starts to listen, and after that start processing next worker.
  With 200 concurrent requests for 10 seconds, the availability of the application was 99.7%

  ```jsx
  import cluster from "cluster";
  import { cpus } from "os";
  import http from "http";
  import { once } from "events";

  const { pid } = process;

  if (cluster.isPrimary) {
    process.on("SIGUSR2", async () => {
      const workers = Object.values(cluster.workers);

      for (let i = 0; i < workers.length; i++) {
        const worker = workers[i];
        console.log(`Stopping worker with pid ${worker.process.pid}`);

        worker.disconnect();
        await once(worker, "exit");

        if (!worker.exitedAfterDisconnect) continue;

        const newWorker = cluster.fork();
        await once(newWorker, "listening");
      }
    });

    // ...
  } else {
    // ...
  }
  ```

## Stateful communications

Consider a case where an application instance stores some information in memory. In this case, there is a state stored in memory. When the request, where a state matters, is made, it can be handled differently depending on which instance of the application handles it, because different instances might have different states.

![Stateful communications](./assets/stateful-communications.png)

Sharing a state between instances can be done with a database, or in-memory stores like Redis or Memcached. But this might require significant changes in our application, because we now might rewrite the logic of storing locally with storing in a shared place.

Sharing a state between instances can be done with a database, or in-memory stores like Redis or Memcached. But this might require significant changes in our application, because we now might rewrite the logic of storing locally with storing in a shared place.

It’s also possible to use sticky load balancing. When the request is made, the load balancer associates the session with application instance, and for every subsequent request, it forwards the request to the according application instance. The session is generated by application, or load balancer, and usually attached to the cookies.

Another simpler approach is using hash function that, according to the request IP, generates an ID representing application instance. However, this breaks for devices using different IPs (changing network for example).

Sticky load balancing nullifies the redundancy of the application, where any instance of the application can handle the request the same way, and the stop of one doesn’t affect the result. For this reason, this technique should be avoided.

Sticky load balancing is not natively supported by `cluster` module can be done with `sticky-session` package.

![Sticky load balancing](./assets/sticky-load-balancing.png)

## Reverse proxy

`cluster` module is not an only technique we can use to scale our application. Another option is to use multiple instances of the application running on the same, or different machines, and then use a reverse proxy. Reverse proxy is service or device that forwards the request to the application instances, and return the result as it were a request destination itself. In this case, reverse proxy also acts as a load balancer. The reasons to use this technique:

1. Load balancing can be managed not only with application instances in the same machine, but in multiple machines.
2. The request is forwarded even if the server is written in another language.
3. Most reverse proxies support sticky load balancing out of the box.
4. We can use more complex load balancing algorithms.
5. Many reverse proxies offer additional features, such as URL rewrites, caching, web server (for example serving static files), security features, and others.
