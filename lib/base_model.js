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

var RObject = require(require.resolve('nodiak')+"/../lib/robject.js");
var inherits = require('trustfund').inherits;
var async = require('async');

var BaseModel = function BaseModel(key, init_data, check_constraints) {
    this.bucket = BaseModel.caller.client ? BaseModel.caller.client.bucket(BaseModel.caller.type.toLowerCase()) : undefined;

    BaseModel.super_.call(this, this.bucket, key, this.data, this.metadata);

    if(init_data && init_data.constructor == Object) {
        this.init(init_data, check_constraints);
    }
}; inherits(BaseModel, RObject);

BaseModel.type = 'BaseModel';
BaseModel.prototype.attrs = {};
BaseModel.prototype.hasChanged = true; // true by default, sets to false on find and fetch, until some other change happens.

BaseModel.prototype.init = function(data, check_constraints) {
    if(data && (data).constructor.name == Object.name) {
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

BaseModel.find = function find(/* criteria, _return */) {
    var criteria = typeof(arguments[0]) === 'object' ? arguments[0] : {};
    //var depth = arguments[1] instanceof Function ? true : false;
    var _return = arguments[arguments.length-1] instanceof Function ? arguments[arguments.length-1] : function(){};

    var caller_inst = new this();
    var compiled_results = [];
    var errors = [];

    var ops = [];
    if(Array.isArray(criteria.keys)) {
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
        caller_inst.bucket.objects.get(criteria.keys).stream(findResultHandler);
    }

    function getTwoi(_complete) {
        caller_inst.bucket.search.twoi(criteria.twoi.range, criteria.twoi.index).stream(findResultHandler);
    }

    function getSolr(_complete) {
        caller_inst.bucket.search.solr(criteria.search).stream(findResultHandler);
    }

    function findResultHandler(response) {
        response.on('data', function(obj) {
            obj.__proto__ = caller_inst;
            obj.hasChanged = false;
            compiled_results.push(obj);
        });
        response.on('error', function(err) {
            errors.push(err);
        });
        response.on('end', function() {
            _complete();
        });
    }
};

BaseModel.prototype.setMeta = function(name, value) {
    BaseModel.super_.prototype.setMeta.apply(this, arguments);
    this.hasChanged = true;
    return this;
};

BaseModel.prototype.removeMeta = function(name) {
    BaseModel.super_.prototype.removeMeta.apply(this, arguments);
    this.hasChanged = true;
    return this;
};

BaseModel.prototype.addToIndex = function(name, value) {
    BaseModel.super_.prototype.addToIndex.apply(this, arguments);
    this.hasChanged = true;
    return this;
};

BaseModel.prototype.removeFromIndex = function(name, value) {
    BaseModel.super_.prototype.removeFromIndex.apply(this, arguments);
    this.hasChanged = true;
    return this;
};

BaseModel.prototype.clearIndex = function() {
    BaseModel.super_.prototype.clearIndex.apply(this, arguments);
    this.hasChanged = true;
    return this;
};

BaseModel.prototype.fetch = function(depth, _return) {
    _return = _return instanceof Function ? _return : depth;
    depth = depth instanceof Function ? Infinity : depth;

    var _this = this;

    if(depth === 0 ) {
        BaseModel.super_.prototype.fetch.call(this, _return);
    }
    else {
        BaseModel.deep_fetch_(this, depth, {}, _return);
    }
};

BaseModel.deep_fetch = function(model, depth, accum, _return) {

//BaseModel.prototype.deep_fetch_ = function(model, depth, accum, _return) {

    var errors = [];

    if(depth >= 0 && (accum[model.type] === undefined || accum[model.type][model.key] === undefined)) {
        BaseModel.super_.prototype.fetch.call(model, function(err, result) {
            if(err) {
                err.data = model;
                _return(err, result);
            }
            else {
                accum[model.type] = accum[model.type] === undefined ? {} : accum[model.type];
                accum[model.type][model.key] = model;

                BaseModel.deep_fetch(model, depth, accum, function(err, result) {

                });
            }
        });
    }
    else if(accum[_this.type] && accum[_this.type][_this.key]) {
        _this = 
    }

    // for(var attr in this.attrs) {
    //     if((this.attrs[attr].is && this.attrs[attr].is.super_ == BaseModel) || (this.attrs[attr].of && this.attrs[attr].of.super_ == BaseModel)) {
    //         if(this.data && this.data[attr] && this.data[attr] instanceof BaseModel) {
    //             this.data[attr] = new this.attrs[attr].is(this.data[attr]);
    //             this.data[attr].fetch(depth-1, function(err, result) {

    //             });
    //         }
            // else if(this.data && this.data[attr] && this.data[attr] instanceof Array) {
            //     for(var i = 0, len = this.data[attr].length; i < len; i++) {
            //         //get_save_or_delete_working_set(this.data[attr][i], depth-1, set, accum);
            //     }

            //     async.map(_this.data[attr],
            //         function(key, iterate) {
            //            _this.data[attr] 
            //         },
            //         function(err, results) {
            //         }
            //     );
            // }
            // else if(this.data && this.data[attr] && this.data[attr] instanceof Object) {
            //     async.each(this.data[attr],
            //         function(key, iterate) {
            //         },
            //         function(err) {
            //         }
            //     );
            // }
    //     }
    // }
};

BaseModel.prototype.save = function(depth, _return) {
    _return = _return instanceof Function ? _return : depth;
    depth = depth instanceof Function ? Infinity : depth;

    var _this = this;
    var errors = [];

    if(depth <= 0) {
        BaseModel.super_.prototype.save.call(this, _result);
    }
    else {
        async.each(get_save_or_delete_working_set(_this, depth, [], {}),
            function(model, iterate) {
                BaseModel.super_.prototype.save.call(model, function(err, result) {
                    if(err) { err.data = _this; errors.push(err); }
                    iterate();
                });
            },
            function(err) {
                if(errors.length === 0) {
                    errors = null;
                }
                else if(errors.length === 1) {
                    errors = errors[0];
                }
                _return(errors, _this);
            }
        );
    }
};

BaseModel.prototype.delete = function(depth, _return) {
    _return = _return instanceof Function ? _return : depth;
    depth = depth instanceof Function ? Infinity : depth;

    var _this = this;
    var errors = [];

    if(depth <= 0) {
        BaseModel.super_.prototype.delete.call(this, _result);
    }
    else {
        async.each(get_save_or_delete_working_set(_this, depth, [], {}),
            function(model, iterate) {
                BaseModel.super_.prototype.delete.call(model, function(err, result) {
                    if(err) { err.data = _this; errors.push(err); }
                    iterate();
                });
            },
            function(err) {
                if(errors.length === 0) {
                    errors = null;
                }
                else if(errors.length === 1) {
                    errors = errors[0];
                }
                _return(errors, _this);
            }
        );
    }
};

var fetch_models_in_array = null;
var fetch_models_in_object = null;

var get_save_or_delete_working_set = function(model, depth, set, accum) {
    if(accum[model.type] === undefined) {
        accum[model.type] = {};
    }

    if(depth >= 0 && !accum[model.type][model.key]) {
        accum[model.type][model.key] = true;
        set.push(model);

        for(var attr in model.attrs) {
            if((model.attrs[attr].is && model.attrs[attr].is.super_ == BaseModel) || (model.attrs[attr].of && model.attrs[attr].of.super_ == BaseModel)) {
                if(model.data && model.data[attr] && model.data[attr] instanceof BaseModel) {
                   get_save_or_delete_working_set(model.data[attr], depth-1, set, accum);
                }
                else if(model.data && model.data[attr] && model.data[attr] instanceof Array) {
                    for(var i = 0, len = model.data[attr].length; i < len; i++) {
                        get_save_or_delete_working_set(model.data[attr][i], depth-1, set, accum);
                    }
                }
                else if(model.data && model.data[attr] && model.data[attr] instanceof Object) {
                    for(var prop in model.data[attr]) {
                        get_save_or_delete_working_set(model.data[attr][prop], depth-1, set, accum);
                    }
                }
            }
        }
    }
    return set;
};

module.exports = BaseModel;
