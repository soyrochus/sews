// #### Sews.js - Simple Eventbus for Web Sockets
// ##### v 0.0.1 - Documentation generated with the lovely [Docco](http://jashkenas.github.com/docco/)
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
// 
import {EventEmitter} from 'events';

//
// 
// bus.error bus.open bus.message bus.unknown

// *
// The Eventbus consist of a server and a client. The server is the central node implementing the "Bus". From the client´s view, 
// there is no difference between a "server" and a "bus" as *any* form of communication is in the form of sending and receiving 
// events to and from the "bus". There is no concept of "request/response" or "RPC" (remote procedure call).
//
//
class WsBus extends EventEmitter {
  
  constructor(options){
    super();
    this.server = new ws.Server(options);
    
    this.server.on('connection', (socket) => {
      let wc = new WsClient(socket);
      this.emit('connection', wc);
      socket.on('message', (message) => {
        console.log('on server: message received', message);
        this.emit('bus.message', message);
        
        try{
          let msg = JSON.parse(message);
          if(!msg.topic || !this._events[msg.topic]){
            console.log('on server: unknown message', msg);
            this.emit('bus.unknown', msg);
          } else {
            console.log('on server: message passed on', msg); 
            this.emit(msg.topic, msg.data, wc);
          }
        }catch(err){
          console.log('on server: message error', err);
          this.emit('bus.error', err);
        }
      });
    });
    
    this.server.on('error', (error)=> {
      console.log('error', error);
      this.emit('bus.error',error);
    });
  }
}


// 
class WsClient extends EventEmitter {

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
    this.ws.on('open', () => {
      if (callback){
        callback();
      }
      this.emit('bus.open');
    });
    this.ws.on('message', (message) => {
      console.log('message received', message);
      try{
        let msg = JSON.parse(message);
        if(!msg.topic || !this._events[msg.topic]){
          this.emit('bus.unknown', msg);
          console.log('message unknown', msg);
        } else {
          console.log('message passed on', msg);
          this.emit(msg.topic, msg.data, this);
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

  send(topic, data){
    //console.log('SEND:',topic, data)
    this.ws.send(JSON.stringify({topic, data}));
  }
}

export default {

  startbus(options){
    return new WsBus(options);
  },

  connect(url, callback){

    return new WsClient(url, callback);
  }
};
