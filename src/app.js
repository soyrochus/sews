// > Copyright (c) 2015 Iwan van der Kleijn
// > All rights reserved.
//
// > This source code is licensed under the BSD-style license found in the LICENSE file in the root directory of this source tree
// 
// This file is part of [Sews](sews.html)

import sews from './sews';

let bus = sews.startbus({port:8080});
bus.on('men.read', (data, con)=> {
  console.log('server received "men.read":', data);
  con.send('men.changed',"Send from Server");
  con.send('nahahahaha', "Send from Server as well");
});

bus.on('bus.error', (error) => {
  console.log('server error: ', error);
});
bus.on('bus.unknown', (data) => {
  console.log('server unkown message: ', data);
}); 

let counter = 0;

let client = sews.connect('ws://localhost:8080', ()=>{
  counter++;
  client.send('men.read', "givemedata: " + counter);
  client.send('men.meep', "givemedataaswell");
});

client.on('men.changed', (data, con)=>{
  console.log('client received "men.changed"', data);
  counter++;
  //client.send('men.read', "givemedata: " + counter);
});

client.on('bus.error', (error) => {
  console.log('Client error:', error);
});

client.on('bus.unknown', (data) => {
  console.log('client unkown message: ', data);
}); 
