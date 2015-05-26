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

import sews from '../sews';
import * as assert from 'assert';

sews.connect('ws://localhost:8080',()=>{
  var token  = 'C40435342D154E2DAFE18973B68C6A30';
  let client = sews.connect('ws://localhost:8080', ()=>{
    

    describe('Data send from the server should be correct', ()=>{
      
      it('including arrays & objects', (done) =>{
        
        client.on('mock.data.retrieved', (data, con, headers)=>{
          
          try {
            assert.equal(4, data.length);
            assert.equal("Daina", data[0].name);
            done();
          } catch(error){
            done(error);
          }         
        });

        client.send('mock.data.read');
      });
      
      it('headers & data send in two directions', (done) =>{
        
        client.on('mock.data.retrieved2', (data, con, headers)=>{
          
          try {
            assert.equal('ABC', headers.token);
            assert.equal("DEF", data.data);
            done();
          } catch(error){
            done(error);
          }         
        });

        client.send({topic:'mock.data.read2', token:'ABC'}, {data:'DEF'});
      });
    });
  });
});
