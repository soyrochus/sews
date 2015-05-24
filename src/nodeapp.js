// > Copyright (c) 2015 Iwan van der Kleijn
// > All rights reserved.
//
// > This source code is licensed under the BSD-style license found in the LICENSE file in the root directory of this source tree
// 
// This file is part of [Sews](sews.html)

import sews from './sews';

let bus = sews.connect('ws://localhost:8080', ()=>{

  bus.send('mock.data.read', {});
});

bus.on('mock.data.retrieved', (data, con)=>{
  console.log('client mock.data.retrieved', data);
  bus.send('mock.data.ping', data);
});

bus.on('mock.data.pong', (data, on) => {
  console.log('Client mock.data.pong', data);
  if (data.length > 0){
    bus.send('mock.data.ping', data);
  } else {
    console.log("TERMINATED");
  }
});

bus.on('bus.error', (error) => {
  console.log('Client error:', error);
});

bus.on('bus.unknown', (data) => {
  console.log('client unkown message: ', data);
}); 

