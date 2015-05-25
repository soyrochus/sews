Sews
====
## Simplified Eventbus on Web Sockets

##### v 0.0.2 - Documentation generated with the lovely [Docco](http://jashkenas.github.com/docco/)

> Copyright (c) 2015 Iwan van der Kleijn
> All rights reserved.

> This source code is licensed under the BSD-style license found at the bottom of this page and in the LICENSE file in the root
> directory of this source tree.

##### *This software is pre-alpha. Use at your own risk* 

### Introduction

Sews is a library providing a simple "Evenbus" abstraction on top of Web Sockets. The prime reasons for the existence of Sews, and its
focus point, are:

 - simplicity of use of the library,
 - single focus ("only one way to do things"),
 - easy to implement the underlying protocol if no library is available,
 - to embraces unashamedly the Observer Pattern.

In case you´ll need a more advanced, formalized and stable library which comes with a number of ready made client libraries for
different platforms and Operating Systems, the recommended alternative is [WAMP](http://wamp.ws).

### The Eventbus

The Sews library is based on the abstraction of the Event Bus. Viewing the abstraction the "Bus" should be seen as a 
client, called a "node", which communicates with a "bus" to which an unspecified number of other nodes might be
connected.

    |------|                                              |---------.  .-----        (node)..(node)..(node)
    | Node | <---receive "event" (message on topic) ----- |   Bus   .  .     <-----     (node)..(node)
    |      | --------send "message" to "topic" ---------> |         .  .     ------> (node)..(node)..(node)
    |------|                                              |---------.  .-----            (node)..(node)

The Eventbus as implemented by Sew consist of a single server "node" and multiple client nodes. The server is the central node
implementing the "Bus" and responsible for routing the messages to and from nodes on the bus. From the client node´s view, there
is no difference between a "server" and a "bus" as *any* form of communication is in the form of sending and receiving messages to
and from the "bus". There is no concept of "request/response" or "RPC" (remote procedure call). 

The nodes sends or "publishes" a message to a specific "topic" on the bus. This topic is considered to be the "destination"
of the message. These topics are created dynamically, by the very act of sending them, and do not need to be pre-registered.
Any node connected to the bus, can register itself on the bus as a potential receiver of these messages. 

A topic denotes a destination, and implicit route, for the messages. A topic is a Unicode string which can may contain all
possible Unicode characters apart from:

 - those characters denoted as white space in the Unicode character database (use prohibited)
 - characters: '@', '\', '/', ':', '\*', '{', '}', '%', '#', '$', '&' which are reserved for future use.
 
The character '.' ("dot") has specific meaning in the topic. It divides a topic in distinct parts or chunks. This denotes
a particular hierarchy within the topic an can be used for routing. A topic cannot begin, nor end with a '.' (dot).

Valid topic names are:

 - 日本庭園.枯山水
 - com.skitr.com.blog.posts.2015
 - 25892e17-80f6-415f-9c65-7395632f0223.read
 
Nodes cannot send messages to the following topics:

 - with prefix "bus." ('bus dot') which are reserved for messages related to the bus itself.

In the current version of Sews, there is no way in which a node can send a message to an other node if this is not directly
incorporated in the routing logic of the server c. This will change in the near future. 

### The protocol

Underneath the Eventbus there is a very basic protocol based on a message envelope which supports routing. In the current implementation, the message, or ["letter sheet"](http://en.wikipedia.org/wiki/Letter_sheet), consists of a "tuple" of two elements. The first elements contains a JSON literal object with the destination (topic) of the message and optional headers. The topic is the *only* required, mandatory, element and is encoded as property "topic" with a JSON string value as content. Each additional header is set as an additional property on this object. Each value must be a JSON string value. The second element can be any valid JSON value, including a single JSON object or JSON array. The definitions is:

    [ {<address info>} , <JSON value> ]

with example:

    [{
        "topic": "com.skitr.com.blog.posts.write",
        "expiry.date": "2015-12-12"
     },
     {
        "id": "0568345",
        "title": "From master to journey man"
     }]

Reserved header names are:

  - "topic" (because in use)
  - "oper" or "operation"
  - "id" or "identity"
  - "token"
  - "auth" or "authorization"

Any other header name is valid.

It is possible to "abbreviate" the "letter sheet". Sometimes, you can leave out some elements:

  - replace the headers object with a string which denotes the topic
  - send a one element tuple - i.e. one element array - with one JSON value, either as string or object literal, representing the topic or header object respectively
  - the one element tuple can be replaced by just the single element itself: i.e. just the topic string or object header


Examples, in order:

     // 2 element tuple, with topic string as first element
    ["com.skitr.com.blog.posts.write",
     {
        "id": "0568345",
        "title": "From master to journey man"
        }]

     // 1 element tuple with topic string as first element
    ["com.skitr.com.blog.posts.write"]

     //  with headers object as first element 
    [{
        "topic": "com.skitr.com.blog.posts.write",
        "expiry.date": "2015-12-12"
     }]

     // plain JSON value, the header object 
    {
        "topic": "com.skitr.com.blog.posts.write",
        "expiry.date": "2015-12-12"
    }

     // plain JSON value, the topic string
    "com.skitr.com.blog.posts.write"

### Creating a Node

A client node can be created with the following code. The example is given in ES6. 
 
    import * as sews from 'sews'

    let node = sews.connect('ws://localhost:8080', ()=>{
        console.log('connected');
    });

Currently, a Web Socket URL needs to be passed to the 'connect' method. The URL needs to point at a server node. After the connection
has made, the callback will fire and the 'node' reference can be used to send messages to the Bus and it can be used to register handlers
or event listeners to specified topics on the bus. For example, to register handlers to listen to messages on the 'bus.error' and
'bus.unknown' topics:

    node.on('bus.error', (error, bus, headers) => {
        console.log('Client error:', error);
    });

    node.on('bus.unknown', (data, bus, headers) => {
        console.log('client unknown message: ', data);
    }); 

From a node, messages can be send to topics registered on the Bus. In the following hypothetical example, an empty message is send
to the bus indicating that the data with "People" from "Tables" should be "Read".

    node.send('tables.people.read', {}); //or alternatively, with headers object, withouth content
  
    node.send(headers);

In this example, a corresponding message, containing the data, is send to the bus once the data has been read. A handler should
be registered in order to capture the data:

    node.on('tables.people.retrieved', (data, bus, headers) => {
        console.log('data retrieved: ', data);
    }); 

The relationship between both topics are fully implementation dependent. In Sews very few topics, and "system level" behaviour  are defined.

### Messages to topic "bus."

These messages indicate  messages with a 'local' context, send *from* the bus *to* the registered node. This typically involve error
messages, or "events" indicating the state of the connection between node and Bus, etc. The following topics are defined:

#### bus.error

Errors generated by topics on the bus which cannot be classified of bus related errors.

#### bus.unknown

Fired when an message to an unregistered topic is received.

#### bus.invalid

Fired when an invalid message is received.

#### bus.open

Fired when the connection to the bus is established.

#### bus.message

Fired when a message is received, before parsing by Sews.

#### bus.server.connection

Fired on a server node when a connection from a client node comes in.

### Exception policy

Errors which can be determined before or during sending a message, like a connection error or invalid message format.  must result in an exception instead of an event.


### ECMAScript 6

Sews is written in ECMAScript 6 (2015). If to be executed in an ECMAScript 5 compatible run-time, you´ll need
[Babel](http://babeljs.io) to compile, or transpile, the source files (in src) to their transformed target files (in dist).
For an excellent overview of ES6 see: [https://babeljs.io/docs/learn-es6/](https://babeljs.io/docs/learn-es6/)

### Install

Use npm to install the library.

    npm install sews

or clone the repository from github. A full copy of the library can be found in the 'dist' sub-directory in the root of the project.

### Building from source

After obtaining the sources from github, all dependencies can be installed with npm. Execute in the root directory:

    npm install

Sews uses [Gulp](http://gulpjs.com/) as its task runner and to control the build work-flow. Gulp needs to be installed globally with npm.

    npm install -g gulp

After this, the sources can be build with a single command:

    gulp 

### The source

Check out the [Docco generated source file](http://soyrochus.github.com/remedata/)

### License

> BSD License

> For Sews software

> Copyright (c)2015, Iwan van der Kleijn
> All rights reserved.

> Redistribution and use in source and binary forms, with or without modification,
> are permitted provided that the following conditions are met:

>  * Redistributions of source code must retain the above copyright notice, this
>    list of conditions and the following disclaimer.

>  * Redistributions in binary form must reproduce the above copyright notice,
>    this list of conditions and the following disclaimer in the documentation
>    and/or other materials provided with the distribution.

>  * Neither the name of Sews nor the names of its contributors may be used to
>    endorse or promote products derived from this software without specific
>    prior written permission.

> THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
> ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
> WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
> DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIaABLE FOR
> ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
> (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
> LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
> ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
> (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
> SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

