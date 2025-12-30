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
