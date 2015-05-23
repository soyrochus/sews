// > Copyright (c) 2015 Iwan van der Kleijn
// > All rights reserved.
//
// > This source code is licensed under the BSD-style license found in the LICENSE file in the root directory of this source tree
// 
// This file is part of [Sews](sews.html)

// Import Web Socket library
import * as ws from 'ws';
import WebSocket from 'ws';
import {EventEmitter} from 'events';

// bus.error bus.open bus.message bus.unknown

class WsBus extends EventEmitter {
  
  constructor(options){
    super();
    this.server = new ws.Server(options);
    
    this.server.on('connection', (socket) => {
      let wc = new WsClient(socket);
      this.emit('connection', wc);
      socket.on('message', (message) => {
        this.emit('bus.message', message);
        
        try{
          let msg = JSON.parse(message);
          if(!msg.topic || !this._events[msg.topic]){
            this.emit('bus.unknown', msg);
          } else {
            this.emit(msg.topic, msg.data, wc);
          }
        }catch(err){
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
      
      try{
        let msg = JSON.parse(message);
        if(!msg.topic || !this._events[msg.topic]){
          this.emit('bus.unknown', msg);
        } else {
          this.emit(msg.topic, msg.data, this);
        }
      }catch(err){
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

/*
Event: 'error'

function (error) { }

If the underlying server emits an error, it will be forwarded here.

Event: 'headers'

function (headers) { }

Emitted with the object of HTTP headers that are going to be written to the Stream as part of the handshake.

Event: 'connection'

function (socket) { }



let wss = new ws.Server({port:9000});
wss.on('connection', (ws) => {
  ws.on('message', (message)=> {
    console.log('received: %s', message);
    ws.send('received:' + JSON.stringify(message));
  });

  ws.send('connected');
});

*/