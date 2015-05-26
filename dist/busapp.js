// > Copyright (c) 2015 Iwan van der Kleijn
// > All rights reserved.
//
// > This source code is licensed under the BSD-style license found in the LICENSE file in the root directory of this source tree
//
// This file is part of [Sews](sews.html)

'use strict';

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _sews = require('./sews');

var _sews2 = _interopRequireDefault(_sews);

var bus = _sews2['default'].startbus({ port: 8080 });

/*bus.on('mock.data.read', (data, con)=> {

  console.log("server - mock.data.read");
  con.send('mock.data.retrieved',[
    {id:1, name: "Daina"},
    {id:2, name: "Tecla"},
    {id:3, name: "Marcus"},
    {id:4, name: "Zeke"}
  ]);
});*/

bus.on('mock.data.read', function (data, con, headers) {

  console.log('busapp: ', 'mock.data.read', data, headers);
  con.send({ topic: 'mock.data.retrieved', token: headers.token }, { data: data.data });
});

bus.on('mock.data.ping', function (data, con) {
  data.pop();
  console.log('server - mock.data.ping', data);
  con.send('mock.data.pong', data);
});

bus.on('bus.error', function (error) {
  console.log('server error: ', error);
});

bus.on('bus.unknown', function (data) {
  console.log('server unkown message: ', data);
});
//# sourceMappingURL=busapp.js.map