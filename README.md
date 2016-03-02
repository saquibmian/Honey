Honey is a proof-of-concept (not production ready) service discovery library. The idea is that multiple services would join a cluster and negotiate primary/second roles using Raft, and subscribers (i.e., other services that make use of this cluster) can subscribe for changes in that cluster. 

The library does not yet implement Raft, it currently uses heartbeats and has no concept of master/slave. 
