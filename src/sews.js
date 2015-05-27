// #### Sews.js - Simple Eventbus for Web Sockets
// ##### v 0.1.0 - Documentation generated with the lovely [Docco](http://jashkenas.github.com/docco/)
// 
// > Copyright (c) 2015 Iwan van der Kleijn
// > All rights reserved.
//
// > This source code is licensed under the BSD-style license found in the LICENSE file in the root directory of this source tree.
// 
// Be aware that Sews is written in ECMAScript 6 (2015). If to be executed in an ECMAScript 5 compatible run-time, you´ll need
// [Babel](http://babeljs.io) to compile, or transpile, the source files (in src) to their transformed target files (in dist).
// For an excellent overview of ES6 see: [https://babeljs.io/docs/learn-es6/](https://babeljs.io/docs/learn-es6/)

// ##### Begin Sews.js source

// Import Web Socket library
import * as ws from 'ws';
import WebSocket from 'ws';

import {EventEmitter} from 'events';

let hasWhiteSpace = /\s/;
let hasReservedChars = /[@\\/:\*\{\}\?%#$&]/;
let hasDotsAtEitherEnd = /(^\.).*(\.$)/;

let isValidTopic = function(topic){
  return true;
  //return !(hasWhiteSpace.test(topic) || hasReservedChars.test(topic) || hasDotsAtEitherEnd.test(topic));
}

// parse message object & verify structure & guarantee fixed structure [headers, message]
let parseLetterSheet = function(data){
  let msg = JSON.parse(data);

  if ((typeof msg === "string") || ((msg instanceof Array) && (msg.length > 0) && (msg.length < 3))){
    // if topic send as string; incorporate as 
    if (!msg.length){
      msg = [{topic:msg}, undefined];
    } 
    if (typeof msg[0] === 'string'){
      msg[0] = {topic: msg[0]}
    }
    if (msg.length == 1){
      msg.push(undefined);
    }
    if(!msg[0].topic){
      throw new Error("Message needs a topic");
    }
    //console.log("parseLetterSheet:", msg); 
    return msg;
  } else {
    throw new Error("Invalid or unknown message format");
  }
}

// The Eventbus consist of a server and a client. The class WsBus implements the server which is the central node forming the 
// actual "Bus". From the client´s view, here is no difference between a "server" and a "bus" as *any* form of communication is 
// in the form of sending and receiving events to and from the "bus". For the moment, in the current implementation, underneath 
// this tidy abstraction, there remains the messy plumbing of a client-server architecture based on Web Sockets.
class WsBus extends EventEmitter {

  // Options are a direct mapping to the options object of the 'ws' WebSocket library
  constructor(options){
    super();
    this.server = new ws.Server(options);
    // The 'connection' event on the web socket object is fired when there is an incoming
    // connection.
    this.server.on('connection', (socket) => {

      // An open web socket is passed and encapsulated in a WsClient instance. This is used to comminicate between Server
      // and this particular client
      let wc = new WsClient(socket);
      this.emit('bus.server.connection', wc);
      // Fired when a message is received from the client
      socket.on('message', (message) => {
        //console.log('on server: message received', message);
        this.emit('bus.message', message);
        let msg = [undefined, undefined];
        try{
          // Parse message and validate that the envelope has a known and registered topic
          // the _events property is a private member of an EventEmitter which maintains 
          // the keys of all registered event listeners or handlers.
          msg = parseLetterSheet(message);
          // if unknown, fire the corresponding system event
          if(!this._events[msg[0].topic]){
            //console.log('on server: unknown message', msg);
            this.emit('bus.unknown', msg);
          } else {
            // console.log('on server: message passed on', msg);
            // the handlers have signarure
            // handler(data: any, wc: WsClient, headers: object): void 
            this.emit(msg[0].topic, msg[1], wc, msg[0]);
          }
        }catch(err){
          console.log('on server: message error', err, msg);
          this.emit('bus.error', err, wc, msg[1]);
        }
      });
    });

    //Delegate error
    this.server.on('error', (error)=> {
      console.log('error', error);
      this.emit('bus.error',error);
    });
  }

  /* TODO close ?? */

  on(topic, handler){
    if(!isValidTopic(topic)){
      throw new Error('Invalid topic');
    }
    super.on(topic, handler);
  }
}


// 
class WsClient extends EventEmitter {

  // The signature of WsClient´s contructor is:
  // constructor(arg mixed, callback: function): void 
  // The constructor´s first argument contains either a WebSocker or an url (string). In case of the former, 
  // it is being encapsulated in the WsClient instance (for use server-sider). The latter form is for use on 
  // the client side. The parameter needs the url which to connect to. The callback is fired when the connection
  // has been established.
  constructor (arg, callback){
    super();
    let url;
    // If already created - server side, it is not used client side - this one is used to encapsulate a WebSocket
    if (arg instanceof WebSocket){
      this.ws = arg;
      return;
    }else {
      url = arg;
    }
    // Create new instance of socket client side
    this.ws = new WebSocket(url);
    // Fire callback if present when the 'open' event is fired
    this.ws.on('open', () => {
      if (callback){
        callback();
      }
      // Instead of the callback, a handler can be registered on the 'bus.open' event as well.
      this.emit('bus.open');
    });

    // For any incoming message, this event is fired. 
    this.ws.on('message', (message) => {
      //console.log('message received', message);
      try{
        // Parse message and validate that the envelope has a known and registered topic
        // the _events property is a private member of an EventEmitter which maintains 
        // the keys of all registered event listeners or handlers.

        let msg = parseLetterSheet(message);
        // if unknown, fire the corresponding system event
        if(!this._events[msg[0].topic]){
          //console.log('message unknown', msg);
          this.emit('bus.unknown', msg);
        } else {
          //console.log('message passed on', msg);
          // the handlers have signarure
          // handler(data: any, wc: WsClient, headers: object): void 
          this.emit(msg[0].topic, msg[1], this, msg[0]);
        }
      }catch(err){
        console.log('message error:', error);
        this.emit('bus.error', err);
      }
    });
    this.ws.on('error', (error) => {
      this.emit('bus.error', error);
    });
  }

  on(topic, handler){
    if(!isValidTopic(topic)){
      throw new Error('Invalid topic');
    }
    super.on(topic, handler);
  }
  
  close(){
    this.ws.close();
  }

  send(topicOrHeaders, data){
    // Pack the data and topic in a basic Sews envelope and send it as JSON to 
    // the server or client on the other side of the connection.
   
    var topic = topicOrHeaders.topic || topicOrHeaders; 
    if (!isValidTopic(topic)){
      throw new Error("Invalid topic or header object");
    }

    let lettersheet;
    if (typeof data == "undefined"){
      lettersheet = topicOrHeaders;
    } else {
      lettersheet = [topicOrHeaders, data]; 
    }

    this.ws.send(JSON.stringify(lettersheet));
  }
}

export default {

  // Create new instance of am Eventbus ("server" component)
  startbus(options){
    return new WsBus(options);
  },

  // Connect to an Eventbus
  connect(url, callback){
    return new WsClient(url, callback);
  }
};
