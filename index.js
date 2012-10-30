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

var Chinood = function Chinood(models, client) {
    this.client = client;

    this.models = models || {};
    this.models[Chinood.BaseModel.name] = Chinood.BaseModel;
};

Chinood.inherits = require('trustfund').inherits;
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
        models[model.name] = model;
    }
    return new Chinood(models, client);
};

Chinood.modelEncoder = function(data) {
    function modelToKey(prop, value) {
        if(value && prop !== '' && ((value).constructor == Chinood.BaseModel || (value).constructor.super_ == Chinood.BaseModel)) {
            return value.key;
        }
        return value;
    }
    return JSON.stringify(data, modelToKey);
};

Chinood.prototype.registerModel = function(model) {
    model.client = this.client;
    this.models[model.name] = model;
};

module.exports = Chinood;