// (The MIT License)

// Copyright (c) 2012 Coradine Aviation Systems
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

var RObject = require(require.resolve('nodiak')+"/../lib/robject.js");
var inherits = require('trustfund').inherits;

var BaseModel = function BaseModel(init_data, check_constraints, client) {
    BaseModel.super_.call(this);

    this.bucket = BaseModel.caller.client.bucket(BaseModel.caller.name || BaseModel.name);

    if(init_data !== undefined) {
        this.init(init_data, check_constraints);
    }
}; inherits(BaseModel, RObject);

BaseModel.prototype.init = function(data, check_constraints) {
    if((data).constructor.name == Object.name) {
        if(check_constraints) {
            for(var key in data) {
                this[key] = data[key];
            }
        }
        else {
            this.data = data;
        }
        return this;
    }
    else if((data).constructor.name == String.name) {
        return this.init(JSON.parse(data));
    }
};

BaseModel.prototype.defineAttribute = function(attr_name, type) {
    if(this.data === undefined) this.data = {};
    if(this.types === undefined) this.types = {};

    this.data[attr_name] = undefined;
    this.types[attr_name] = type;

    var _this = this;

    this.__defineGetter__(attr_name, function() {
        if(this.types[attr_name].name == Function.name) {
            return _this.data[attr_name](this);
        }
        else {
            return _this.data[attr_name];
        }
    });
    
    this.__defineSetter__(attr_name, function(value) {
        if((value).constructor == _this.types[attr_name]) {
            _this.data[attr_name] = value;
        }
        else {
            throw new TypeError(_this.constructor.name + " cannot set attribute '" + attr_name + "' to type " + (value).constructor.name + ", expected " + _this.types[attr_name].name);
        }
    });
};

BaseModel.find = function(_return) {
    _return(null, null);
};

module.exports = BaseModel;
