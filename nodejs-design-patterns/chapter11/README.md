# Advanced recipes

- [Asynchronously initialized components](#asynchronously-initialized-components)

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
