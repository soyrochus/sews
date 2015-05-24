// > Copyright (c) 2015 Iwan van der Kleijn
// > All rights reserved.
//
// > This source code is licensed under the BSD-style license found in the LICENSE file in the root directory of this source tree
// 
// This file is part of [Sews](sews.html)

import sews from './sews';

let bus = sews.startbus({port:8080});

bus.on('mock.data.read', (data, con)=> {

  console.log("server - mock.data.read");
  con.send('mock.data.retrieved',[
    {id:1, name: "Daina"},
    {id:2, name: "Tecla"},
    {id:3, name: "Marcus"},
    {id:4, name: "Zeke"}
  ]);
});

bus.on('mock.data.ping', (data, con)=> {
  data.pop();
  console.log("server - mock.data.ping", data);
  con.send('mock.data.pong', data);
});

bus.on('bus.error', (error) => {
  console.log('server error: ', error);
});

bus.on('bus.unknown', (data) => {
  console.log('server unkown message: ', data);
}); 
