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
var async = require('async');

var BaseModel = function BaseModel(key, init_data, check_constraints) {
    BaseModel.super_.call(this);

    this.key = key;
    this.bucket = BaseModel.caller.client ? BaseModel.caller.client.bucket(BaseModel.caller.name.toLowerCase()) : undefined;
    this.hasChanged = true;

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

BaseModel.prototype.defineAttribute = BaseModel.prototype.attr = function(attr_name, type) {
    if(this.data === undefined) this.data = {};
    if(this.attr_types === undefined) this.attr_types = {};

    this.data[attr_name] = undefined;
    this.attr_types[attr_name] = type;

    var _this = this;

    this.__defineGetter__(attr_name, function() {
        if(this.attr_types[attr_name].name == Function.name) {
            return _this.data[attr_name](this);
        }
        else {
            return _this.data[attr_name];
        }
    });
    
    this.__defineSetter__(attr_name, function(value) {
        if((value).constructor == _this.attr_types[attr_name]) {
            _this.data[attr_name] = value;
            _this.hasChanged = true;
        }
        else if((value).constructor == Array  && _this.attr_types[attr_name].constructor == Array && _this.attr_types[attr_name][0].super_ == BaseModel) {
            _this.data[attr_name] = value;
            _this.hasChanged = true;
        }
        else {
            throw new TypeError(_this.constructor.name + " cannot set attribute '" + attr_name + "' to type " + (value).constructor.name + ", expected " + _this.attr_types[attr_name].name);
        }
    });
};

BaseModel.prototype.fetch = function(with_children, _return) {
    _return = _return instanceof Function ? _return : with_children;
    with_children = with_children === true ? with_children : false;

    var _this = this;

    this.doOp('fetch', with_children, function(err, results) {
        if(err) _return(err, results);
        else _return(err, results);
    });
};

BaseModel.prototype.delete = function(with_children, _return) {
    _return = _return instanceof Function ? _return : with_children;
    with_children = with_children === true ? with_children : false;

    var _this = this;

    this.doOp('delete', with_children, function(err, results) {
        if(err) _return(err, undefined);
        else _return(err, undefined);
    });
};

BaseModel.prototype.save = function(with_children, _return) {
    _return = _return instanceof Function ? _return : with_children;
    with_children = with_children === true ? with_children : false;

    var _this = this;

    this.doOp('save', with_children, function(err, results) {
        if(err) _return(err, undefined);
        else _return(err, _this);
    });
};

BaseModel.prototype.doOp = function(op, with_children, _return) {
    var _this = this;
    var errors = [];

    var base_case = function(_complete) {
        if((op == 'fetch' && _this.hasChanged) || (op == 'save' && _this.hasChanged) || op == 'delete') {
            BaseModel.super_.prototype[op].call(_this, function(err, result) {
                if(err) { console.log(err); err.data = _this; errors.push(err); }
                _complete();
            });
        }
        else {
            _complete();
        }
    };

    //var deep_fetch = function(_complete) {
        // var working_set = [];
        
        // for(var attr in _this.attr_types) {
        //     if(_this.attr_types[attr].super_ == BaseModel) {
        //         // Create triplets of [attr, type, value], used below via [0], [1], [2].
        //         working_set.push([attr, _this.attr_types[attr], _this.data[attr]]);
        //     }
        // }
        // async.forEach(working_set,
        //     function(item, _sub_complete) {
        //         if(item[2].constructor != Array) {
        //             // //console.log(item);
        //             // item = new item[1](item[2]);
        //             // item.doOp(op, true, function(err, result) {
        //             //     //console.log(result);
        //             //     if(err) { err.data = item; errors.push(err); }
        //             //     else { item = result; completions.push(item); }
        //             //     //console.log(item);
        //             //     _sub_complete(null, null);
        //             // });
        //         }
        //         else {
        //             async.forEach(item,
        //                 function(sub_item, _sub_sub_complete) {
        //                     console.log(sub_item);
        //                     sub_item.doOp(op, true, function(err, result) {
        //                         if(err) { err.data = item; errors.push(err); }
        //                         else { completions.push(result); }
        //                         _sub_sub_complete(null, null);
        //                     });
        //                 },
        //                 function(err) {
        //                     _sub_complete();
        //                 }
        //             );
        //         }
        //     },
        //     function(err) {
        //         _complete();
        //     }
        //);
    //};

    var deep_save_delete = function(_complete) {
        var working_set = [];
        
        for(var attr in _this.attr_types) {
            if(_this.attr_types[attr].super_ == BaseModel) {
                working_set.push(_this.data[attr]);
            }
        }

        async.forEach(working_set,
            function(item, _sub_complete) {
                if(item.constructor != Array) {
                    item.doOp(op, true, function(err, result) {
                        if(err) { err.data = item; errors.push(err); }
                        _sub_complete();
                    });
                }
                else {
                    async.forEach(item,
                        function(sub_item, _sub_sub_complete) {
                            sub_item.doOp(op, true, function(err, result) {
                                if(err) { err.data = item; errors.push(err); }
                                _sub_sub_complete();
                            });
                        },
                        function(err) {
                            _sub_complete();
                        }
                    );
                }
            },
            function(err) {
                _complete();
            }
        );
    };

    if(op == 'fetch') {
        async.series(with_children === true ? [base_case, deep_fetch] : [base_case], function() {
            if(errors.length === 0) {
                errors = null;
            }
            else if(errors.length === 1) {
                errors = errors[0];
            }
            _return(errors, _this);
        });
    }
    else {
        async.parallel(with_children === true ? [base_case, deep_save_delete] : [base_case], function() {
            if(errors.length === 0) {
                errors = null;
            }
            else if(errors.length === 1) {
                errors = errors[0];
            }
            _return(errors, _this);
        });
    }
};

module.exports = BaseModel;
