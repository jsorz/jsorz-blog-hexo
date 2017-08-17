---
layout: post
title: "upgrade to jquery seems outdated"
description: ""
keywords: ""
category: javascript
tags: []
---

前面忙了三个多月，从11月开始前期的计划和调研，到12月开始每天早起，到年后2月底差不多小结。除了正常的需求迭代开发之外，全都投在了这一件事，把系统的前端做了个大重构。这是这半年的代码量统计，实际没那么多，因为是重构，insertions 和 deletions 都会被录入代码行数。真的体会了把重构是个体力活儿，起步阶段会比较快，但后面会越来越陷入debug，这和开发是一样的。。

<!-- break -->

<img src="/assets/captures/20170305_code_stats.png" style="max-width:800px;">

做了啥
-------


组件库
-------


### class.js 实现

```
define(function () {
    var initializing = false;
    var fnTest = /xyz/.test(function () {var xyz; }) ? /\b_super\b/ : /.*/;
    // The base Class implementation (does nothing)
    var Class = function () {};
    // Create a new Class that inherits from this class
    Class.extend = function (prop) {
        var superProto = this.prototype;
        // Instantiate a base class (but only create the instance,
        // don't run the init constructor)
        initializing = true;
        var prototype = new this();
        initializing = false;
        // Copy the properties over onto the new prototype
        for (var name in prop) {
            // Check if we're overwriting an existing function
            prototype[name] = typeof prop[name] === 'function'
                && typeof superProto[name] === 'function' && fnTest.test(prop[name])
                ? (function (name, fn) {
                    return function () {
                        var tmp = this._super;
                        // Add a new ._super() method that is the same method
                        // but on the super-class
                        this._super = superProto[name];
                        // The method only need to be bound temporarily, so we
                        // remove it when we're done executing
                        var ret = fn.apply(this, arguments);
                        this._super = tmp;
                        return ret;
                    };
                })(name, prop[name])
                : prop[name];
        }
        // The dummy class constructor
        function Class() {
            // All construction is actually done in the init method
            if (!initializing && this.init) {
                this.init.apply(this, arguments);
            }
        }
        // Populate our constructed prototype object
        Class.prototype = prototype;
        // Enforce the constructor to be what we expect
        Class.prototype.constructor = Class;
        // And make this class extendable
        Class.extend = arguments.callee;
        return Class;
    };
    return Class;
});
```


构建打包
--------


上线考虑
--------


