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
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; }

var _ws = require('ws');

var ws = _interopRequireWildcard(_ws);

var _ws2 = _interopRequireDefault(_ws);

var _events = require('events');

var hasWhiteSpace = /\s/;
var hasReservedChars = /[@\\/:\*\{\}\?%#$&]/;
var hasDotsAtEitherEnd = /(^\.).*(\.$)/;

var isValidTopic = function isValidTopic(topic) {
  return true;
  //return !(hasWhiteSpace.test(topic) || hasReservedChars.test(topic) || hasDotsAtEitherEnd.test(topic));
};

// parse message object & verify structure & guarantee fixed structure [headers, message]
var parseLetterSheet = function parseLetterSheet(data) {
  var msg = JSON.parse(data);

  if (typeof msg === 'string' || msg instanceof Array && msg.length > 0 && msg.length < 3) {
    // if topic send as string; incorporate as
    if (!msg.length) {
      msg = [{ topic: msg }, undefined];
    }
    if (typeof msg[0] === 'string') {
      msg[0] = { topic: msg[0] };
    }
    if (msg.length == 1) {
      msg.push(undefined);
    }
    if (!msg[0].topic) {
      throw new Error('Message needs a topic');
    }
    //console.log("parseLetterSheet:", msg);
    return msg;
  } else {
    throw new Error('Invalid or unknown message format');
  }
};

// The Eventbus consist of a server and a client. The class WsBus implements the server which is the central node forming the
// actual "Bus". From the client´s view, here is no difference between a "server" and a "bus" as *any* form of communication is
// in the form of sending and receiving events to and from the "bus". For the moment, in the current implementation, underneath
// this tidy abstraction, there remains the messy plumbing of a client-server architecture based on Web Sockets.

var WsBus = (function (_EventEmitter) {

  // Options are a direct mapping to the options object of the 'ws' WebSocket library

  function WsBus(options) {
    var _this = this;

    _classCallCheck(this, WsBus);

    _get(Object.getPrototypeOf(WsBus.prototype), 'constructor', this).call(this);
    this.server = new ws.Server(options);
    // The 'connection' event on the web socket object is fired when there is an incoming
    // connection.
    this.server.on('connection', function (socket) {

      // An open web socket is passed and encapsulated in a WsClient instance. This is used to comminicate between Server
      // and this particular client
      var wc = new WsClient(socket);
      _this.emit('bus.server.connection', wc);
      // Fired when a message is received from the client
      socket.on('message', function (message) {
        //console.log('on server: message received', message);
        _this.emit('bus.message', message);
        var msg = [undefined, undefined];
        try {
          // Parse message and validate that the envelope has a known and registered topic
          // the _events property is a private member of an EventEmitter which maintains
          // the keys of all registered event listeners or handlers.
          msg = parseLetterSheet(message);
          // if unknown, fire the corresponding system event
          if (!_this._events[msg[0].topic]) {
            //console.log('on server: unknown message', msg);
            _this.emit('bus.unknown', msg);
          } else {
            // console.log('on server: message passed on', msg);
            // the handlers have signarure
            // handler(data: any, wc: WsClient, headers: object): void
            _this.emit(msg[0].topic, msg[1], wc, msg[0]);
          }
        } catch (err) {
          console.log('on server: message error', err, msg);
          _this.emit('bus.error', err, wc, msg[1]);
        }
      });
    });

    //Delegate error
    this.server.on('error', function (error) {
      console.log('error', error);
      _this.emit('bus.error', error);
    });
  }

  _inherits(WsBus, _EventEmitter);

  _createClass(WsBus, [{
    key: 'on',

    /* TODO close ?? */

    value: function on(topic, handler) {
      if (!isValidTopic(topic)) {
        throw new Error('Invalid topic');
      }
      _get(Object.getPrototypeOf(WsBus.prototype), 'on', this).call(this, topic, handler);
    }
  }]);

  return WsBus;
})(_events.EventEmitter);

//

var WsClient = (function (_EventEmitter2) {

  // The signature of WsClient´s contructor is:
  // constructor(arg mixed, callback: function): void
  // The constructor´s first argument contains either a WebSocker or an url (string). In case of the former,
  // it is being encapsulated in the WsClient instance (for use server-sider). The latter form is for use on
  // the client side. The parameter needs the url which to connect to. The callback is fired when the connection
  // has been established.

  function WsClient(arg, callback) {
    var _this2 = this;

    _classCallCheck(this, WsClient);

    _get(Object.getPrototypeOf(WsClient.prototype), 'constructor', this).call(this);
    var url = undefined;
    // If already created - server side, it is not used client side - this one is used to encapsulate a WebSocket
    if (arg instanceof _ws2['default']) {
      this.ws = arg;
      return;
    } else {
      url = arg;
    }
    // Create new instance of socket client side
    this.ws = new _ws2['default'](url);
    // Fire callback if present when the 'open' event is fired
    this.ws.on('open', function () {
      if (callback) {
        callback();
      }
      // Instead of the callback, a handler can be registered on the 'bus.open' event as well.
      _this2.emit('bus.open');
    });

    // For any incoming message, this event is fired.
    this.ws.on('message', function (message) {
      //console.log('message received', message);
      try {
        // Parse message and validate that the envelope has a known and registered topic
        // the _events property is a private member of an EventEmitter which maintains
        // the keys of all registered event listeners or handlers.

        var msg = parseLetterSheet(message);
        // if unknown, fire the corresponding system event
        if (!_this2._events[msg[0].topic]) {
          //console.log('message unknown', msg);
          _this2.emit('bus.unknown', msg);
        } else {
          //console.log('message passed on', msg);
          // the handlers have signarure
          // handler(data: any, wc: WsClient, headers: object): void
          _this2.emit(msg[0].topic, msg[1], _this2, msg[0]);
        }
      } catch (err) {
        console.log('message error:', error);
        _this2.emit('bus.error', err);
      }
    });
    this.ws.on('error', function (error) {
      _this2.emit('bus.error', error);
    });
  }

  _inherits(WsClient, _EventEmitter2);

  _createClass(WsClient, [{
    key: 'on',
    value: function on(topic, handler) {
      if (!isValidTopic(topic)) {
        throw new Error('Invalid topic');
      }
      _get(Object.getPrototypeOf(WsClient.prototype), 'on', this).call(this, topic, handler);
    }
  }, {
    key: 'close',
    value: function close() {
      this.ws.close();
    }
  }, {
    key: 'send',
    value: function send(topicOrHeaders, data) {
      // Pack the data and topic in a basic Sews envelope and send it as JSON to
      // the server or client on the other side of the connection.

      var topic = topicOrHeaders.topic || topicOrHeaders;
      if (!isValidTopic(topic)) {
        throw new Error('Invalid topic or header object');
      }

      var lettersheet = undefined;
      if (typeof data == 'undefined') {
        lettersheet = topicOrHeaders;
      } else {
        lettersheet = [topicOrHeaders, data];
      }

      this.ws.send(JSON.stringify(lettersheet));
    }
  }]);

  return WsClient;
})(_events.EventEmitter);

exports['default'] = {

  // Create new instance of am Eventbus ("server" component)
  startbus: function startbus(options) {
    return new WsBus(options);
  },

  // Connect to an Eventbus
  connect: function connect(url, callback) {
    return new WsClient(url, callback);
  }
};
module.exports = exports['default'];
//# sourceMappingURL=sews.js.map