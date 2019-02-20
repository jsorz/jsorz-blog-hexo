---
layout: post
title: "现在还在重构jquery..."
keywords: "jquery, class实现, gulp构建"
category: 开发
tags: [web组件, AMD]
---

前面忙了三个多月，从11月开始前期的计划和调研，到12月开始每天早起，到年后2月底差不多小结。除了正常的需求迭代开发之外，全都投在了这一件事，把系统的前端做了个大重构。这是这半年的代码量统计，实际没那么多，因为是重构，insertions 和 deletions 都会被录入代码行数。真的体会了把重构是个体力活儿，起步阶段会比较快，但后面会越来越陷入debug，这和开发是一样的。。

<!-- more -->

<img src="/images/captures/20170305_code_stats.png">

业务背景
-------
上图是我最近半年的代码提交统计，近三个月的提交激增，正是因为重构。简单罗列下这项工作的背景

- 公司这个产品最初是用了一个开源框架实现的，但去年下半年该框架已宣布停止维护
- 此前的代码夹杂着原生js和框架js实现的逻辑，但是产品业务的发展不允许我们停下手头的工作来重做此前的业务功能
- 有个兄弟产品已经完成了旧代码和新业务齐头并进的整改，将旧代码重构的同时，加了一些新业务或新UI元素进去

因此团队决定从兄弟产品中抽取可复用的组件元素，形成我们俩产品通用的组件库，而在这基础上再将我们的产品代码迁移成新代码。

说了这么多废话，其实这套“新代码”仍是jquery，因为以前我们连jquery都用不起。。虽然这项重构工作是实实在在的体力活，但经历过后又让我重新思考以前对所谓的“组件”的认识，因为这个过程中走了不少弯路。


做了啥
------
简单罗列下我所做的事情

- 从兄弟产品中抽取可复用的组件和交互元素，形成组件库的base
  - 要保证组件中没有业务强相关的逻辑，有则必须抽离出去，作为自定义参数或回调函数的方式实现
  - 保证组件库中的组件都是可以复用到相似产品的，同时尽量不要破坏组件原有的参数格式
  - 组件库中的组件都是可以再二次扩展的，可以使用继承或组合的方式，揉入业务强相关逻辑
- 业务特有的组件就放在业务的代码库中，或者称为`业务库组件`
  - 业务页面中会同时依赖组件库中的组件和业务库组件
  - 业务库组件可能是基于组件库组件做二次开发而形成的，也可能是独立的新组件
- 使用 gulp 进行打包，并做成可复用的`build模块`
  - 可由业务指定“我只需要组件库中的哪些组件”
  - 组件库的组件和业务库的同名组件，可通过不同的 namespace 区分
  - *可自动判断一个页面中所需组件的最小集，只将最少代码打包到页面中*

最后，利用这套框架，将旧的业务代码逐页面迁移过来。。虽然最后这步是纯粹的体力活儿，但其中踩了不少坑，也反映了一些设计问题，会在本文最后一部分中一起来review。


组件库
-------

### class.js 实现

```js
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

特点：

- 类式继承
- 继承的链式调用
- 提供`_super`调用父类函数的方式

缺点

- 使用这套方式定义的类，实例化后对象的`constructor`都指向了上面的`Class`函数，丢失了面向对象中重要的`instanceof`信息。

注：在[Javascript模式之五-代码复用模式](/blog/2014/03/js-pattern-part5-code-reuse-pattern.html#阶段7-Klass)写过另一种实现，保留了`constructor`

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

定义了三种 base class，分别代表非UI组件，UI组件和绘图组件，具体组件再依次继承。

### 私有成员保护

```js
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

由于通过`Class.extend`，会将所有属性挂到`prototype`上，所以必须将实例属性区分开，这里约定将`__private`里面的属性直接挂在实例上。（在 UIBase 的 init 函数里操作）

### 组件扩展

```js
define(function (require) {
    var Table = require('sawse/component/Table');

    return Table.extend({
    	// 覆盖父类方法
        render: function (table) {
        	// 调用父类的同名方法
            this._super(table);
            // do something else
        }
    });
});
```


构建打包
--------

```bash
gulp [task] [--dir=PROJECT_DIR] [--config=CONFIG_FILE]
```

使用 gulp 来组织构建，对库代码和业务代码分别配置。


```js
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

以上只列了组件库的一些配置项，还有对业务库、页面的打包配置，具体的实现抽成了一个独立模块，细节这里略过。

使用 glulp 就是很多事情得自己做，在 stream 里做字符串处理，拼接文件等操作。。。

上线考虑
--------

简单来说就是得兼容，因为重构和迁移是逐步推进的，线上会存在一个过渡期，通过路由字典指明哪些是走新页面，哪些走旧页面。而且新旧页面的产物必须在两个完全隔离的目录下，便于发布和回滚。（旧页面也可能在这个过渡期有bugfix发布）

总结思考
--------

**1、动态类型一时爽，代码重构火葬场**

- 真理！特别是面对好几年前的N手代码，看着很正规的函数在调用时都会防不胜防
- 需要好好评估重构的代价，重构之后一两年内是否还需要重构，长痛不如短痛的`重做`还是`重构`

2、使用什么库并不是第一位的重要，业务组件的梳理和规范性才是页面实现时的瓶颈

- 不管用什么库，把业务通用的组件梳理出来并规范几种使用场景，这是项目需要沉淀出的base，在这之上做需求会很快

3、**不要轻易将一个产品中的组件去统一到另一个产品**

- 即本文开头列的`从兄弟产品中抽取可复用的组件和交互元素，形成组件库的base`，现在感觉是件很傻的事情，经验不足
- 不同产品必定有不同的交互思路，想要从其他产品抽出的组件库作为base组件，势必还要再包一层改造成自己产品的业务组件
- 只有纯粹的组件库是可取的，比如 Bootstrap、ElementUI、AntDesign，可以在其上包装成自己的业务组件

4、工欲善其事必先利其器

- gulp 的自动化程度还不够，很多特性比如子页面的打包，比如组件及样式的分批合并，需要在 stream 手写很多。。

