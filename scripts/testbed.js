var inspect = require('util').inspect;
var nodiak = require('nodiak').getClient('http', 'localhost', 8091);
var chinood = require('../index.js').init(__dirname+'/../test/models/', nodiak);
var Models = chinood.models;

var c1 = new Models.Circular('c1');

var circ1 = new Models.Circular('circ1');
console.log(circ1.constructor.super_);
// var circ2 = new Models.Circular('circ2');

// circ1.next = circ2;
// circ2.next = circ1;

// circ1.fetch(Infinity, function(err, result) {
//     console.log(circ1);
// });
// var c2 = new Models.Circular('c2');
// var c3 = new Models.Circular('c3');

// c1.next = c2;
// c1.prev = c3;
// c1.bunch.push(c1, c1, c1, c2);

// c2.next = c3;
// c2.prev = c1;
// c2.bunch.push(c1, c1, c1, c1);

// c3.next = c3;
// c3.prev = c2;
// c3.bunch.push(c3, c2, c1, c3);

//console.log(c1.next.next.next.next);

// c3.next = c1;
// c3.prev = c2;
//debugger;

// c1.save(Infinity, function(err, res) {
//     console.log("!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!");
//     // c1.save(2, function(err, res) {
//     //     console.log("!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!#!");
//     // });
// });

// c1.fetch(Infinity, function(err, res) {
//     debugger;
//     console.log("*&*&*&*&*&*&*&*&*&*&*&*&*&*&*&*&*&*&*&*&*&*&*&*&*&*&*&*&*&*&*&*&*&*&*&*&*&*&*&*&*&*");
//     console.log(res.next.next.next.next);
// });

