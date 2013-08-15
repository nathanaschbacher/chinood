// (The MIT License)

// Copyright (c) 2012 Nathan Aschbacher

// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// 'Software'), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:

// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
// CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
// TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
// SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var chinood = require('../../index.js');
var MyModel = require('./my_model.js');

var MyOtherModel = chinood.defineModel('MyOtherModel', {

    other_number: { is: Number, default: 5, index: true },
    other_string: { default: "Hello There!"},
    other_array: { is: Array, of: Number }, // 'of' is a no-op hint, it's just for readability, there's no constraint enforced.
    other_thing: { is: MyModel },
    other_function: { is: Function, default: get_other }, // this is a computed attribute, these values do not persist to Riak.
    other_date: { is: Date, default: new Date(), index: true }

});

function get_other(_this) {
    var temp = '';
    for(var i = 0, times = _this.other_number; i < times; i++) {
        temp += " " + _this.other_string + "\n\n";
    }
    return temp;
}

module.exports = MyOtherModel;
