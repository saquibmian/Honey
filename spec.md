# service-layer
- GET `/api/service` -- get all service registrations across all clusters
- GET `/api/service/{cluster}` -- get a stable endpoint in the cluster
- POST `/api/service/{cluster}` -- register a service in a cluster
	- accepts { endpoint: <url>, onDrop: <url>, isBroadcast: true }
	- returns { id: <serviceId>, ttl: <seconds> }
- PUT `/api/service/{cluster}` -- hearbeat, ttl is 30 seconds, with 3x grace period (nodes can be marked as unstable)
	- accepts { id: <serviceId> }
- DELETE `/api/service/{cluster}` -- unregister a service in a cluster
	- accepts { id: <serviceId> }
- GET `/api/service/{cluster}/subscribe` -- subscribe to a stable endpoint in the cluster; you will be notified if this end point expires, and will be provided with a new stable one
	- accepts { onUpdate: <url> }
- DELETE `/api/service/{cluster}/subscribe` -- unsubscribe from a stable endpoint in the cluster

# client-layer
As part of the initial registration, Clients must provide an onDrop URL hook, that will be sent a request to an alternate Honey instance in the event that this one falls offline. They must use that instance for hearbeats/discovery in the future.

As part of the service subscription process, clients must provide an onUpdate URL hook that will keep the client in sync
	
# honey-layer
Honey is simply a special-cased cluster, known as the root cluster. GET requests on that cluster are tied down to admins only.

# propagation facility
...is wired via forwardding POST and PUT requests to all other Honey instances in the realm

