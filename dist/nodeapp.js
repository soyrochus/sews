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

var bus = _sews2['default'].connect('ws://localhost:8080', function () {

  bus.send('mock.data.read', {});
});

bus.on('mock.data.retrieved', function (data, con) {
  console.log('client mock.data.retrieved', data);
  bus.send('mock.data.ping', data);
});

bus.on('mock.data.pong', function (data, on) {
  console.log('Client mock.data.pong', data);
  if (data.length > 0) {
    bus.send('mock.data.ping', data);
  } else {
    console.log('TERMINATED');
  }
});

bus.on('bus.error', function (error) {
  console.log('Client error:', error);
});

bus.on('bus.unknown', function (data) {
  console.log('client unkown message: ', data);
});
//# sourceMappingURL=nodeapp.js.map