var inspect = require('util').inspect;
var async = require('async');
var nodiak = require('nodiak').getClient('http', 'localhost', 10018);
var chinood = require('../index.js').init(__dirname+'/../test/models/', nodiak);
var Models = chinood.models;

var c1 = new Models.Circular('c1');

var circ1 = new Models.Circular('circ1');
var circ2 = new Models.Circular('circ2');

var obj = {one: 1, two: 2, three: 3, four: 4};

async.each(Object.keys(obj),
	function(key, iterate) {
		console.log(obj[key]);
	},
	function(err) {
		console.log("done");
	}
);

// circ1.next = circ1;
// circ2.next = circ1;
// circ1.prev = circ2;
// circ2.bunch.push(circ1, circ2);

//var temp = Models.BaseModel.get_working_set(circ1, 0, [], {});
//console.log(temp);

//console.log(circ1.next.next.next.next.next.next);
// circ1.fetch(0, function(err, result) {
// 	console.log(err);
// 	console.log("Completed");

// 	// circ1.delete(1, function(err, result) {
// 	// 	console.log(err);
// 	// 	console.log("Completed");
// 	// });
// });

// circ1.delete(1, function(err, result) {
// 	console.log(err);
// 	console.log("Completed");
// });

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

