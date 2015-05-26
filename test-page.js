
(function(){


  var bus = new WebSocket('ws://localhost:8080');

  bus.onopen = function () {
    //console.log("Conn open");
  };

  // Log errors
  bus.onerror = function (error) {
    console.log('WebSocket Error ' + error);
  };
  
  // Log messages from the server
  bus.onmessage = function (data) {

    console.log('Message received', data);

  };

  var textarea = document.getElementById('message-text');
  var button = document.getElementById('send');

  button.addEventListener('click', function(){
    console.log(textarea.value);
    bus.send(textarea.value);
  });


})();