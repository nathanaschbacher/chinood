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
    this.bucket = BaseModel.caller.client ? BaseModel.caller.client.bucket(BaseModel.caller.type.toLowerCase()) : undefined;

    if(init_data && init_data.constructor == Object) {
        this.init(init_data, check_constraints);
    }
    BaseModel.super_.call(this, this.bucket, key, this.data, this.metadata);
}; inherits(BaseModel, RObject);

BaseModel.type = 'BaseModel';
BaseModel.prototype.attrs = {};
BaseModel.prototype.hasChanged = true;

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

BaseModel.find = function find(/* criteria, depth, _return */) {
    var criteria = typeof(arguments[0]) === 'object' ? arguments[0] : {};
    var depth = arguments[1] === true ? true : false;
    var _return = arguments[arguments.length-1] instanceof Function ? arguments[arguments.length-1] : function(){};

    var caller_inst = new this();
    var compiled_results = [];
    var errors = [];

    var ops = [];
    if(criteria.keys instanceof Array) {
        ops.push(getKeys);
    }
    if(criteria.twoi instanceof Object) {
        ops.push(getTwoi);
    }
    if(criteria.solr instanceof Object) {
        ops.push(getSolr);
    }

    if(ops[0]) {
        async.parallel(ops, function() {
            errors = errors.length > 0 ? errors : null;
            _return(errors, compiled_results);
        });
    }
    else {
        _return(new TypeError("Invalid Criteria, please make sure that you have keys: [], twoi: [], and/or solr: {} set."), null);
    }

    function getKeys(_complete) {
        caller_inst.bucket.objects.get(criteria.keys).stream(function(response) {
            response.on('data', function(obj) {
                obj.__proto__ = caller_inst;
                compiled_results.push(obj);
            });
            response.on('error', function(err) {
                errors.push(err);
            });
            response.on('end', function() {
                _complete();
            });
        });
    }

    function getTwoi(_complete) {
        caller_inst.bucket.search.twoi(criteria.twoi.range, criteria.twoi.index).stream(function(response) {
            response.on('data', function(obj) {
                obj.__proto__ = caller_inst;
                compiled_results.push(obj);
            });
            response.on('error', function(err) {
                errors.push(err);
            });
            response.on('end', function() {
                _complete();
            });
        });
    }

    function getSolr(_complete) {
        caller_inst.bucket.search.solr(criteria.search).stream(function(response) {
            response.on('data', function(obj) {
                obj.__proto__ = caller_inst;
                compiled_results.push(obj);
            });
            response.on('error', function(err) {
                errors.push(err);
            });
            response.on('end', function() {
                _complete();
            });
        });
    }
};

BaseModel.prototype.fetch = function(depth, _return) {
    _return = _return instanceof Function ? _return : depth;
    depth = depth === true ? depth : false;

    var _this = this;

    _this.doOp('fetch', depth, function(err, results) {
        if(err) { _return(err, results); }
        else { _return(err, _this); }
    });
};

BaseModel.prototype.delete = function(depth, _return) {
    _return = _return instanceof Function ? _return : depth;
    depth = depth === true ? depth : false;

    var _this = this;

    this.doOp('delete', depth, function(err, results) {
        if(err) _return(err, undefined);
        else _return(err, undefined);
    });
};

BaseModel.prototype.save = function(depth, _return) {
    _return = _return instanceof Function ? _return : depth;
    depth = depth === true ? depth : false;

    var _this = this;

    this.doOp('save', depth, function(err, results) {
        if(err) _return(err, undefined);
        else _return(err, _this);
    });
};

BaseModel.prototype.doOp = function(op, depth, _return) {
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
        
        for(var attr in _this.attrs) {
            if(_this.attrs[attr] && _this.attrs[attr].is && (_this.attrs[attr].is.super_ == BaseModel || _this.attrs[attr].of.super_ == BaseModel)) {
                working_set.push(_this.data[attr]);
            }
        }

        async.forEach(working_set,
            function(item, _sub_complete) {
                if(item.constructor != Array && item.constructor != Object) {
                    item.doOp(op, depth, function(err, result) {
                        if(err) { err.data = item; errors.push(err); }
                        _sub_complete();
                    });
                }
                else if(item.constructor == Object) {
                    var keys = Object.keys(item);
                    async.forEach(keys,
                        function(key, _sub_sub_complete) {
                            item[key].doOp(op, depth, function(err, result) {
                                if(err) { err.data = item; errors.push(err); }
                                _sub_sub_complete();
                            });
                        },
                        function(err) {
                            _sub_complete();
                        }
                    );
                }
                else if(item.constructor == Array) {
                    async.forEach(item,
                        function(sub_item, _sub_sub_complete) {
                            sub_item.doOp(op, depth, function(err, result) {
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
        async.series(depth > 0 ? [base_case, deep_fetch] : [base_case], function() {
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
        async.parallel(depth > 0 ? [base_case, deep_save_delete] : [base_case], function() {
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
