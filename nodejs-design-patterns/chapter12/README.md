# Chapter 12: Scalability and Architectural Patterns

When JavaScript was created, it was perfect for distributed systems because of its non-blocking behavior. Ranging from a few nodes to thousands, communicating with each other over the network.

NodeJS is single-threaded, so it might not utilize all the capacity of multi-core machine, but this is one side of coin. In reality, scalability doesn’t only refer to increasing capacity of machine and handling more requests faster, but also high availability, and fault-tolerance. Breaking the code in multiple components can also be considered as scalability strategy in terms of development.

Because NodeJS is single-threaded, the only way to scale it is to distribute it over multiple instances and machines. But with this, we also get higher availability and fault tolerance of the application.
