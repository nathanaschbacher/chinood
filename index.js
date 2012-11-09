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

var fs = require('fs');
var inherits = require('trustfund').inherits;

var Chinood = function Chinood(models, client) {
    this.client = client;
    this.models = models || {};
};

Chinood.BaseModel = require('./lib/base_model.js');

Chinood.init = function(models_root, client) {
    client.defaults.mime['application/json'].encode = Chinood.modelEncoder;

    models_root = models_root.charAt(models_root.length-1) == '/' ? models_root : models_root + '/';
        
    var files = fs.readdirSync(models_root);
    var models = { BaseModel: Chinood.BaseModel };

    for(var i = 0, length = files.length; i < length; i++) {
        files[i] = models_root+files[i];
        model = require(files[i]);
        model.client = client;
        models[model.type] = model;
    }
    return new Chinood(models, client);
};

Chinood.defineModel = function defineModel(name, attributes) {
    var NewModel = function() {
        Chinood.BaseModel.apply(this, arguments);

        if(this.attr_defaults) {
            this.hasChanged = true;
        
            for(var attr_name in this.attr_defaults) {
                if(this.data[attr_name] === undefined) {
                    if(this.attrs[attr_name].is && this.attrs[attr_name].is == Date && this.attr_defaults[attr_name].constructor == String) {
                        if(this.data[attr_name] === 'now') {
                            this.data[attr_name] = new Date();
                        }
                        else {
                            this.data[attr_name] = new Date(this.data[attr_name]);
                        }
                    }
                    else {
                        this.data[attr_name] = this.attr_defaults[attr_name];
                    }
                }
            }
        }
    }; inherits(NewModel, Chinood.BaseModel);

    NewModel.type = name;
    NewModel.prototype.type = name;
    NewModel.prototype.attrs = attributes;
    for(var i in NewModel.prototype.attrs) {
        Chinood.defineAttribute(NewModel, i);
    }
    return NewModel;
};

Chinood.defineAttribute = function(model, attr_name) {
    // cache defaults for use on instantiation.
    if(model.prototype.attrs[attr_name] && model.prototype.attrs[attr_name].hasOwnProperty('default')) {
        model.prototype.attr_defaults = model.prototype.attr_defaults || {};
        model.prototype.attr_defaults[attr_name] = model.prototype.attrs[attr_name].default;
    }

    model.prototype.__defineGetter__(attr_name, function() {
        if(this.attrs[attr_name].is && this.attrs[attr_name].is.name === Function.name) {
            return this.data[attr_name](this);
        }
        else {
            if(this.attrs[attr_name] && this.attrs[attr_name].is == Array && this.data[attr_name] === undefined) {
                this.data[attr_name] = [];
                return this.data[attr_name];
            }
            else if(this.attrs[attr_name] && this.attrs[attr_name].is == Object && this.attrs[attr_name].is.name == Object.name && this.data[attr_name] === undefined) {
                this.data[attr_name] = {};
                return this.data[attr_name];
            }
            if(this.attrs[attr_name].is && this.attrs[attr_name].is.name === Date.name && this.data[attr_name].constructor == String) {
                return new Date(this.data[attr_name]);
            }
            else {
                return this.data[attr_name];
            }
        }
    });

    model.prototype.__defineSetter__(attr_name, function(value) {
        if((value).constructor == this.attrs[attr_name].is || this.attrs[attr_name].is === undefined) {
            this.data[attr_name] = value;

            if(this.attrs[attr_name].index) {
                this.clearIndex(attr_name);
                this.addToIndex(attr_name, value);
            }
            this.hasChanged = true;
            return this;
        }
        else {
            throw new TypeError(this.type + " cannot set attribute '" + attr_name + "' to type " + (value).constructor.name + ", expected " + this.attrs[attr_name].is.name);
        }
    });

    return model;
};

Chinood.modelEncoder = function(data) {
    return JSON.stringify(data, Chinood.modelToKey);
};

Chinood.modelToKey = function(prop, value) {
    if(value && prop !== '' && ((value).constructor == Chinood.BaseModel || (value).constructor.super_ == Chinood.BaseModel)) {
        return value.key;
    }
    else {
        return value;
    }
};

Chinood.prototype.registerModel = function(model) {
    model.client = this.client;
    this.models[model.type] = model;
};

module.exports = Chinood;

