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

    _this.doOp('fetch', depth, {}, function(err, results) {
        if(err) { _return(err, results); }
        else { _this.hasChanged = false; _return(err, _this); }
    });
};

BaseModel.prototype.delete = function(depth, _return) {
    _return = _return instanceof Function ? _return : depth;
    depth = depth instanceof Function ? 0 : depth;

    var _this = this;

    this.doOp('delete', depth, {}, function(err, results) {
        if(err) _return(err, undefined);
        else _return(err, undefined);
    });
};

BaseModel.prototype.save = function(depth, _return) {
    _return = _return instanceof Function ? _return : depth;
    depth = depth instanceof Function ? Infinity : depth;

    var _this = this;

    async.parallel([
        
    ],
    function() {

    })


    this.deep_save_(depth, {}, function(err, results) {
        if(err) _return(err, undefined);
        else _return(err, _this);
    });
};



BaseModel.prototype.deep_save_ = function(depth, accum, _return) {
    var _this = this;

    if(depth > 0) {

    }
    else {
        async.parallel([

        ],
        function() {

        });

        this.constructor.super_.save.call(this, function(err, result) {
            if(err) {

            }
            else {
                console.log(result.metadata.etag+result.key+result.type);
                accum[result.metadata.etag+result.key+result.type] = _this;
            }
        });


    }
};


var start_case = function(op, accum, _complete) {
    if((op === 'fetch' || (op === 'save' && _this.hasChanged) || op === 'delete') && !accum[_this.key+_this.type]) {
        BaseModel.super_.prototype[op].call(_this, function(err, result) {
            if(err) { console.log(err); err.data = _this; errors.push(err); }
            console.log("%sed %s of type %s", op, _this.key, _this.type);
            accum[_this.key+_this.type] = op === 'fetch' ? result : true;
            _complete();
        });
    }
    else {
        if(op === 'fetch' && accum[_this.key+_this.type]) {
            _this = accum[_this.key+_this.type];
        }
        _complete();
    }
};

/*
    Fetch:
        Create accum cache.
        If in cache
            return from cache
        Else not in cache
            Hydrate object.
            Place hydrated into accum cache.
            Iterate over attrs looking for Models.
                If Model previously hydrated
                    get model out of accum cache
                    assign to attr
                    end
                Else not visited
                    fetch

*/

BaseModel.prototype.deep_fetch = function(depth, accum, _return) {
    var _this = this;

    if(accum[_this.key+_this.type]) {
        _return(null, accum[_this.key+_this.type]);
    }
    else {
        BaseModel.super_.prototype.fetch.call(_this, function(err, result) {
            if(err) {
                console.log(err);
                err.data = _this;
                _return(err, null);
            }
            else {
                accum[_this.key+_this.type] = _this;
                var working_set = build_working_set(_this.attrs);

                async.forEach(working_set,
                    function(attr_name, _complete) {

                    },
                    function(err) {

                    }
                );
            }
        });
    }
};

BaseModel.prototype.doOp = function(op, depth, accum, _return) {
    var _this = this;
    var errors = [];
    accum = accum || {};

    if(op === 'fetch') {

        if(!accum[_this.key+_this.type]) {
            BaseModel.super_.prototype.fetch.call(_this, function(err, result) {
                if(err) { console.log(err); err.data = _this; errors.push(err); }
                console.log("%sed %s of type %s", op, _this.key, _this.type);
                accum[_this.key+_this.type] = op === 'fetch' ? result : true;
                _complete();
            

            });
            async.series(depth > 0 ? [start_case, deep_fetch] : [start_case], function() {
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
            console.log("already saw: '%s', of type: %s", _this.key, _this.type);
            console.log("should attach: %s", accum[_this.key+_this.type].key);
            console.log("did attach: %s", _this.key);
            _return(null, _this);
        }
    }
    else {
        if(!accum[_this.key+_this.type]) {
            accum[_this.key+_this.type] = true;
            async.parallel(depth > 0 ? [start_case, deep_save_delete] : [start_case], function() {
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
            console.log("already saw: '%s', of type: %s", _this.key, _this.type);
            _return(null, _this);
        }
    }
};

var is_model = function(value) {
    if(value && value.is && val)
}

var build_working_set = function(attrs) {
    var working_set = [];
    for(var attr in attrs) {
        if((attrs[attr].is && attrs[attr].is.super_ == BaseModel) || (attrs[attr].of && attrs[attr].of.super_ == BaseModel)) {
            working_set.push(attr);
        }
    }
    return working_set;
};

var old_deep_fetch = function(_complete) {
    var working_set = build_working_set(_this.attrs);

    async.forEach(working_set,
        function(attr, _sub_complete) {
            //console.log("%s is a %s", attr, _this.data[attr].constructor);
            if(_this.data[attr] !== undefined && _this.data[attr] !== null)
                if(!Array.isArray(_this.data[attr]) && !(_this.data[attr] instanceof Object && _this.data[attr].constructor == Object)) {
                    var temp = new _this.attrs[attr].is(_this.data[attr]);
                    temp.doOp(op, depth-1, accum, function(err, result) {
                        if(err) { console.log(err); err.data = item; errors.push(err); }
                        else {
                            _this.data[attr] = temp;
                        }
                        _sub_complete();
                    });
                }
                else if(_this.data[attr] instanceof Object && _this.data[attr].constructor == Object) {
                    async.forEach(Object.keys(_this.data[attr]),
                        function(sub_key, _sub_sub_complete) {
                            //console.log("in Object, %s is a %s", sub_key, _this.data[attr][sub_key].constructor);
                            var temp = new _this.attrs[attr].of(_this.data[attr][sub_key]);
                            temp.doOp(op, depth-1, accum, function(err, result) {
                                if(err) { console.log(err); err.data = item; errors.push(err); }
                                else { _this.data[attr][sub_key] = temp; }
                                _sub_sub_complete();
                            });
                        },
                        function(err) {
                            _sub_complete();
                        }
                    );
                }
                else if(Array.isArray(_this.data[attr])) {
                    async.map(_this.data[attr],
                        function(sub_key, _sub_sub_complete) {
                            //console.log("in Array, %s is a %s", sub_key, "???");
                            var temp = new _this.attrs[attr].of(sub_key);
                            //console.log(temp);
                            temp.doOp(op, depth-1, accum, function(err, result) {
                                if(err) { console.log(err); err.data = item; errors.push(err); }
                                //else { sub_key = temp; }
                                _sub_sub_complete(null, temp);
                            });
                        },
                        function(err, results) {
                            _this.data[attr] = results;
                            _sub_complete();
                        }
                    );
                }
                else {
                    _sub_complete();
                }
            else {
                _sub_complete();
            }
        },
        function(err) {
            _complete();
        }
    );
};

var deep_save_delete = function(_complete) {
    var working_set = build_working_set(_this.attrs);

    async.forEach(working_set,
        function(attr, _sub_complete) {
            var item = _this.data[attr];

            if(item !== undefined && item !== null) {
                if(!Array.isArray(item) && !(item instanceof Object && item.constructor == Object)) {
                   if(item.doOp) { // if already seen down this path, just break to avoid cycling.
                        item.doOp(op, depth-1, accum, function(err, result) {
                            if(err) { err.data = item; errors.push(err); }
                            _sub_complete();
                        });
                    }
                    else {
                        _sub_complete();
                    }
                }
                else if(item instanceof Object && item.constructor == Object) {
                    var keys = Object.keys(item);
                    async.forEach(keys,
                        function(sub_key, _sub_sub_complete) {
                            if(item[sub_key].doOp) {
                                item[sub_key].doOp(op, depth-1, accum, function(err, result) {
                                    if(err) { err.data = item; errors.push(err); }
                                    _sub_sub_complete();
                                });
                            }
                            else {
                                _sub_sub_complete();
                            }
                        },
                        function(err) {
                            _sub_complete();
                        }
                    );
                }
                else if(Array.isArray(item)) {
                    async.forEach(item,
                        function(sub_item, _sub_sub_complete) {
                            if(sub_item.doOp) {
                                sub_item.doOp(op, depth-1, accum, function(err, result) {
                                    if(err) { err.data = item; errors.push(err); }
                                    _sub_sub_complete();
                                });
                            }
                            else {
                                _sub_sub_complete();
                            }
                        },
                        function(err) {
                            _sub_complete();
                        }
                    );
                }
                else {
                    _sub_complete();
                }
            }
            else {
                _sub_complete();
            }
        },
        function(err) {
            _complete();
        }
    );
};

module.exports = BaseModel;
