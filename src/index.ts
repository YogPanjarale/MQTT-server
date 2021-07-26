import { Client, PublishPacket, Subscription } from 'aedes';
import {Server} from 'aedes';
import cluster from 'cluster'
import authenticate from './authenticate';
const mqemitter = require('mqemitter-mongodb');
const mongoPersistence = require('aedes-persistence-mongodb');


const MONGO_URL = 'mongodb://127.0.0.1/aedes-clusters'

function startAedes () {
  const port = 1883;
  
  const aedes = Server({
    id: 'BROKER_' + cluster.worker.id,
    mq: mqemitter({
      url: MONGO_URL
    }),
    persistence: mongoPersistence({
      url: MONGO_URL,
      // Optional ttl settings
      ttl: {
        packets: 300, // Number of seconds
        subscriptions: 300
      }
    })
  })

  const server = require('net').createServer(aedes.handle)

  server.listen(port, function () {
    console.log('Aedes listening on port:', port)
    const packet:PublishPacket={
        topic:"aedes/hello",
        payload:"I'm broker"+aedes.id,
        cmd:"publish",
        qos:0,
        retain:false,
        dup:false,
    }
    aedes.publish(packet,()=>null)
  })
//@ts-ignore
aedes.authenticate=authenticate
  aedes.on('subscribe', function (subscriptions: Subscription[], client: Client) { 
    
    console.log('MQTT client \x1b[32m' + (client ? client.id : client) +
            '\x1b[0m subscribed to topics: ' + subscriptions.map(s => s.topic).join('\n'), 'from broker', aedes.id)
  })
//@ts-ignore
  aedes.on("unsubscribe", function (subscriptions: Subscription[], client: Client) {
    console.log('MQTT client \x1b[32m' + (client ? client.id : client) +
            '\x1b[0m unsubscribed to topics: ' + subscriptions.join('\n'), 'from broker', aedes.id)
  })

  // fired when a client connects
  aedes.on('client', function (client:Client) {
    console.log('Client Connected: \x1b[33m' + (client ? client.id : client) + '\x1b[0m', 'to broker', aedes.id)
  })

  // fired when a client disconnects
  aedes.on('clientDisconnect', function (client:Client) {
    console.log('Client Disconnected: \x1b[31m' + (client ? client.id : client) + '\x1b[0m', 'to broker', aedes.id)
  })

  // fired when a message is published
  aedes.on('publish', async function (packet:PublishPacket, client:Client) {
    console.log('Client \x1b[31m' + (client ? client.id : 'BROKER_' + aedes.id) + '\x1b[0m has published', packet.payload.toString(), 'on', packet.topic, 'to broker', aedes.id)
  })
}

if (cluster.isMaster) {
//   const numWorkers = require('os').cpus().length;
const numWorkers = 1;
  for (let i = 0; i < numWorkers; i++) {
    cluster.fork()
  }

  cluster.on('online', function (worker) {
    console.log('Worker ' + worker.process.pid + ' is online')
  })

  cluster.on('exit', function (worker, code, signal) {
    console.log('Worker ' + worker.process.pid + ' died with code: ' + code + ', and signal: ' + signal)
    console.log('Starting a new worker')
    cluster.fork()
  })
} else {
  startAedes()
}
