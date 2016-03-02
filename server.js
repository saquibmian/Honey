/// <reference path="typings/node/node.d.ts"/>
/// <reference path="typings/morgan/morgan.d.ts"/>
/// <reference path="typings/express/express.d.ts" />
/// <reference path="typings/body-parser/body-parser.d.ts" />

var express = require('express');
var parser = require('body-parser');
var morgan = require('morgan');
var guid = require('./guid.js');

var app = express()
var port = process.env.PORT || 8080;
var ttl = process.env.TTL || 30;

// use the parser
app.use(parser.urlencoded({ extended: true }));
app.use(parser.json());
app.use(morgan('tiny'));

// API routes
var router = express.Router();

// catch-alls
router.get('/', function (req, res) {
	res.json({
		message: 'Welcome to Honey!',
		endpoints: router.stack.map(function (route) { return route.route.path })
	});
});

var servicesByCluster = {};

// API /service
router.route('/service')
	.get(function (req, res) {
		res.json(servicesByCluster);
	});
	
// API /service/{cluster}
router.route('/service/:cluster_name')
	.get(function (req, res) {
		var cluster = servicesByCluster[req.params.cluster_name];
		if (cluster === undefined) {
			res.send(404, "No service in that cluster.")
		} else {
			var currentTime = new Date();
			var service = cluster.filter(function(s) {
				return currentTime < s.expiresAt
			});
			if (service.length != 1) {
				res.send(404, "No service in the cluster.")
			} else {
				res.json({ endpoint: service[0].endpoint });
			}
		}
	})
	.put(function (req, res) {
		var cluster = servicesByCluster[req.params.cluster_name];
		if (cluster === undefined) {
			res.send(404, "No service in that cluster.")
		} else {
			var service = cluster.filter(function (s) { return s.id === req.body.id });
			if (service.length != 1) {
				res.send(404, "No service with that ID.")
			} else {
				service[0].expiresAt = new Date(new Date().getTime() + ttl*1000);
				res.send(200);
			}
		}
	})
	.post(function (req, res) {
		var service = {
			id: guid(),
			expiresAt: new Date(new Date().getTime() + ttl*1000),
			endpoint: req.body.endpoint,
			onDrop: req.body.onDrop,
			manage: true,
			isStable: true
		}

		if (req.body.isBroadcast) service.manage = false;

		var cluster = servicesByCluster[req.params.cluster_name];
		if (cluster === undefined) {
			servicesByCluster[req.params.cluster_name] = [];
			cluster = servicesByCluster[req.params.cluster_name];
		}

		cluster.push(service);

		var toReturn = { id: service.id, ttl: service.ttl };
		res.json(toReturn);
	});

app.use('/api', router);

// let's get going!
app.listen(port);
console.log('Listening on port ' + port);
