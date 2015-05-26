/*
var assert = require("assert")
describe('Array', function(){
  describe('#indexOf()', function(){
    it('should return -1 when the value is not present', function(){
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    })
  })
})


import * as assert from 'assert';

describe('Array', ()=> {
  describe('#indexOf()', ()=>{
    it('should return -1 when the value is not present', ()=>{
      assert.equal(-1, [1,2,3].indexOf(5));
      assert.equal(-1, [1,2,3].indexOf(0));
    });
  });
});

bus.on('mock.data.read', (data, con)=> {

  console.log("server - mock.data.read");
  con.send('mock.data.retrieved',[
    {id:1, name: "Daina"},
    {id:2, name: "Tecla"},
    {id:3, name: "Marcus"},
    {id:4, name: "Zeke"}
  ]);
});

*/

'use strict';

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _sews = require('../sews');

var _sews2 = _interopRequireDefault(_sews);

var _assert = require('assert');

var assert = _interopRequireWildcard(_assert);

_sews2['default'].connect('ws://localhost:8080', function () {
  var token = 'C40435342D154E2DAFE18973B68C6A30';
  var client = _sews2['default'].connect('ws://localhost:8080', function () {

    describe('Data send from the server should be correct', function () {

      it('including arrays & objects', function (done) {

        client.on('mock.data.retrieved', function (data, con, headers) {

          try {
            assert.equal(4, data.length);
            assert.equal('Daina', data[0].name);
            done();
          } catch (error) {
            done(error);
          }
        });

        client.send('mock.data.read');
      });

      it('headers & data send in two directions', function (done) {

        client.on('mock.data.retrieved2', function (data, con, headers) {

          try {
            assert.equal('ABC', headers.token);
            assert.equal('DEF', data.data);
            done();
          } catch (error) {
            done(error);
          }
        });

        client.send({ topic: 'mock.data.read2', token: 'ABC' }, { data: 'DEF' });
      });
    });
  });
});
//# sourceMappingURL=test.orig.js.map