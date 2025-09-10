# Chapter 12: Scalability and Architectural Patterns

- [Cluster](#cluster)

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
