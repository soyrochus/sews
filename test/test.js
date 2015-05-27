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
*/

import sews from '../sews';
import * as assert from 'assert';

describe('The user', ()=>{
  it('should be able to send data with a full "round-trip"', (done) =>{

    sews.connect('ws://localhost:8080',()=>{
      var token  = 'C40435342D154E2DAFE18973B68C6A30';
      let client = sews.connect('ws://localhost:8080', ()=>{
        
        client.send({topic: 'mock.data.read', token:'ABC'}, {data: 'DEF'});
      });
      
      client.on('mock.data.retrieved', (data, con, headers)=>{
        
        try {
          assert.equal('ABC', headers.token);
          assert.equal("DEF", data.data);
          done();
        } catch(error){
          done(error);
        }         
      });
    });
  });
});