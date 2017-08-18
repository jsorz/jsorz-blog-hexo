---
layout: post
title: "现在还在用过时的jquery"
keywords: "jquery, class实现, gulp构建"
category: 开发
tags: [web组件, AMD]
---

前面忙了三个多月，从11月开始前期的计划和调研，到12月开始每天早起，到年后2月底差不多小结。除了正常的需求迭代开发之外，全都投在了这一件事，把系统的前端做了个大重构。这是这半年的代码量统计，实际没那么多，因为是重构，insertions 和 deletions 都会被录入代码行数。真的体会了把重构是个体力活儿，起步阶段会比较快，但后面会越来越陷入debug，这和开发是一样的。。

<!-- break -->

<img src="/assets/captures/20170305_code_stats.png" style="max-width:800px;">

做了啥
-------
上图是我最近半年的代码提交统计，



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


### 类层次结构

```
                         Class
                           |
           --------------------------------
          |                |               |
      ClassBase          UIBase        ChartBase
          |                |
       -------          --------
      |       |        |        |
   RecordTarget 等   Dialog, Table 等

```


### 私有成员保护

```
UIBase.extend({
    options: {
    
    },
    __private: {
        _items: null,
        _selectedItems: null
    },
    type: ''
});
```


### 组件扩展

```
define(function (require) {
    var Table = require('sawse/component/Table');

    return Table.extend({
        // 扩展 mtj 表头里的 tip 锚点
        // 省去了事后手动调用 renderThText
        render: function (table) {
            this._super(table);
            // do something else
        }
    });
});
```


构建打包
--------

```
gulp [task] [--dir=PROJECT_DIR] [--config=CONFIG_FILE]
```


```
{
    // 组件库打包
    libPackConf: {
        febase: {
            baseDir: 'fe-base/js/',         // 相对于 src 的路径
            patternsInCopy: ['**/*.js'],    // 以下路径都 相对于 baseDir
            ignoresInCopy: ['dep/**/*.js'], // 在 copy 时过滤
            prependsInPack: [],             // 在 pack 时追加在开头，以保证优先顺序
            patternsInPack: ['**/*.js'],    // 要 pack 的文件，可包含 prependsInPack 的文件
            ignoresInPack: [],              // 在 pack 时过滤
            namespace: 'sawse',             // 组件定义时追加的命名前缀
            outputName: 'sawse.js',         // 打包产物的文件名
            outputDir: 'js/'                // 打包产物的相对于 webroot 的目录
        },
        febaseCss: {
            baseDir: 'fe-base/sass/',       // 相对于 src 的路径
            patternsInCopy: [               // 以下路径都 相对于 baseDir
                '**/*.scss',
                '**/*.css',
                'decorator/**/*'            // css 图片要一起 copy 过来
            ],
            ignoresInCopy: [                // 在 copy 时过滤
                'base/normalize.css',
                'base/reset.css'
            ],
            prependsInPack: [
                'base/sprite_def.css',      // sprite 先定义在开头
                'base/*.css'                // css 合并时要保证优先顺序
            ],
            patternsInPack: ['**/*.css'],   // 只打包编译后的 css 文件
            ignoresInPack: [],              // 在打包时才过滤
            outputName: 'sawse.css',        // 输出打包的文件名（不含路径）
            outputDir: 'css/sawse/'         // 作为 css/ 下的完整子目录（保证图片引用正确）
        }
    }
}
```


上线考虑
--------

