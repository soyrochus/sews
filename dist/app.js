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
bus.on('men.read', function (data, con) {
  console.log('server received "men.read":', data);
  con.send('men.changed', 'Send from Server');
  con.send('nahahahaha', 'Send from Server as well');
});

bus.on('bus.error', function (error) {
  console.log('server error: ', error);
});
bus.on('bus.unknown', function (data) {
  console.log('server unkown message: ', data);
});

var counter = 0;

var client = _sews2['default'].connect('ws://localhost:8080', function () {
  counter++;
  client.send('men.read', 'givemedata: ' + counter);
  client.send('men.meep', 'givemedataaswell');
});

client.on('men.changed', function (data, con) {
  console.log('client received "men.changed"', data);
  counter++;
  //client.send('men.read', "givemedata: " + counter);
});

client.on('bus.error', function (error) {
  console.log('Client error:', error);
});

client.on('bus.unknown', function (data) {
  console.log('client unkown message: ', data);
});
//# sourceMappingURL=app.js.map