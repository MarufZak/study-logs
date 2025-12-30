# System Design Interview Volume 1

![book logo](./assets/logo.jpg)

My notes and takeaways from the System Design Interview book (Volume 1) by Alex Xu.

## Chapter 1. Scale from zero to million users

Building complex systems starts from small step. Here is simple request flow. Usually JSON is response format. Web server makes DB calls.

![Simple server](./assets/1.png)

As users grow, this setup is not suitable, and we need to separate the DB as another server. This allows them to be scaled independently.

![2](./assets/2.png)

There are relational databases (Postgresql, MySQL), and non-relational (Amazon DynamoDB, Cassandra). Relational databases have tables and rows, and tables can be joined. Non-relational databases don't have this. Usually relational DBs perform good, but for some cases it might be better to use non-relational databases, for example: you have unstructured data, you have massive amount of data, you need super-low latency, or you only need serialization/deserialization of the data.

Vertical scaling refers to adding more power (CPU, RAM) to the server, while horizontal scaling refers to adding more servers to your pool of resources. Vertical scaling has limits, as one server cannot be added infinite number of resources, and if the server goes down, the application goes completely down too. For large applications, it's preferable to use horizontal scaling.

With one server setup, if load is high, users generally experience slow response times, so we need more servers. To balance the load between them, load balancer is used.

![3](./assets/3.png)

In this case, the IP user receives from DNS is load balancer's public IP address. The web servers are not exposed to the internet, and load balancer accesses them through private IP addresses in private network. No there is no failover if server goes offline, and if load is high, you only need to add new servers if necessary, and load balancer does the work.

Now web tier is good, but what about data tier? Single database can cause failover and redundancy. The way to go is database replication.

Database replication is having relationship of master node and slave nodes. Master node is used for modifications, while slave nodes are used for reading. Because usually the number of reads is much bigger, slave nodes are usually more than master nodes. This setup provides better performance - as many operations can be handled in parallel, reliability - if one database is destroyed by natural disaster, the copies are preserved in other nodes, high availability - if one node gets offline, another nodes provides availability.

![4](./assets/4.png)

If only one slave database is available and it goes offline, all read operations are temporarily executed on master database. As issue is found, new slave database is created, and it replaces the old one. If multiple slave databases are available, read operations are executed on other healthy slave databases.
If master database goes offline, slave database is promoted to master, and all operations are temporarily executed on new master. New slave database is created immediately for replications. Promoting slave to master can be complicated, because the slave might not have up-to-date data as master does, so some data recovery scripts are needed. There are also [other techniques](https://en.wikipedia.org/wiki/Multi-master_replication) for replication.

It's time to improve response times. We can add cache tier for this. It allows frequent requests or expensive operations to be saved in memory to serve them when requested again. This greatly affects app's performance, because right now each request triggers DB call, and making DB calls repeatedly greatly affects performance.

![5](./assets/5.png)

If data exists in cache, take it, otherwise make DB call, save result in cache, and serve this result. This is called read-through cache. [Other caching strategies](https://codeahoy.com/2017/08/11/caching-strategies-and-how-to-choose-the-right-one/) exists too.

Some considerations for using cache:

1. Use it for accessing frequently requested data and modified infrequently. Cache is stored in volatile memory, if server is down, the cache is lost.
2. Expiration policy. After the cache expires, it is removed from cache. Policy should not be too short so data store is not accessed frequently, and not too long in order to avoid stale data.
3. Consistency between data store and cache. When scaling across multiple regions, it might be challenging to keep them in sync. Facebook has great article about [scaling memcache](https://www.usenix.org/system/files/conference/nsdi13/nsdi13-final170_update.pdf).
4. Single cache server might lead to single point of failure, where cache tier is not accessible at all. To mitigate this, multiple cache servers across different datacenters are used. Also cache overprovisioning is used, where more memory is allocated for cache than it would regularly need (it serves as buffer as memory usage increases).
5. Once cache is full, eviction policy is applied, meaning some item from cache is evicted. It can be LRU (least recently used, most popular), LFU (least frequently used), or FIFO (first in first out).
