---
title: JS中的“多继承”
category: javascript
tags: [javascript]
---

首先 javascript 中不存在多继承，并且也不推荐频繁使用继承。如果你也这么认为的话，那笔者的观点也就写完啦 233333…. 如果还想回顾下 javascript 中“继承”的前世今生，不妨看下去。

<!-- more -->

##

JS 中的原型继承方式**并不能支持多继承**，因为每个构造器仅仅能指定一个原型对象，这是一种单继承形式，实际上是mixin与单继承结合的方式。只有一个类充当真正的父类，其余的类会被用于mixin，而并非真正的多继承。



## 苦苦追求的语法糖

在ES6之前，在还没有使用 React, Vue 等框架之前，我们在做稍复杂的前端页面和组件时，会经常用模块化的思想去封装一些可复用的逻辑，会想着给 javascript 提供“类”的支持，再结合一些设计模式，就可以做出各种灵活的代码结构。

我们知道 javascript 中并不存在“类”，存在的只是原型链，都是通过 `prototype` 去封装了“类”，可以说任何一个函数都可以被视为一个“类”（只要你愿意）

关于 `prototype` 不是本文的重点，笔者一直收藏了这张图经常用来给自己复习。

<img src="/images/captures/20170122_proto.jpg">

那些年，我们一直在等待“类”的语法糖。。。

### 模拟一个类

在强类型的语言中，类是为了面向对象，就不得不提其三大特性【封装】【继承】【多态】

```
var Book = (function() {
  // 私有静态属性
  var privateStaticAttribute = 0;

  // 私有静态方法
  var privateStaticMethod = function() {};

  // 构造函数
  return function(props) {
    // 私有属性
    var title;

    // 私有方法
    this.getTitle = function() { return title; };
    this.setTitle = function(title) {};
  }
})();

// 公有静态方法
Book.staticMethod = function() {};

// 公有方法
Book.prototype.publicSharedMethod = function() {};
```

这样的代码想必都很面熟，借鉴了强类型语言中的“类”的概念，既然是类，它除了封装一些属性和方法，还需要做到可见性的控制。由于 javascript 中没有[可见性修饰符TODO](#)，只能用闭包来模拟 public 与 private。虽然比起 Java 中的类还有很多不足，但至少做到了一些封装，而且通常我们还可以建立命名规范，约定下划线开头的属性名或方法名为私有的。



有了【封装】之后，我们就要考虑【继承】了。javascript 也没有这样的机制，也只能使用 `prototype` 去模拟，实现方式有很多，出现了各种各样的“继承”方法。原型式继承、类式继承，甚至模拟`super`关键字，提供 `Class.extend()`、`this.super()` 等便利的用法，都是运用闭包和 `prototype` 实现的 Syntactic sugar。这也就是过去 [Prototype.js](http://prototypejs.org/learn/class-inheritance) 这样的库对前端产生的影响。



而至于【多态】，在强类型语言中，



### 到了ES5后

我们有了`Object.create()`，

```
function Vehicle(make, year) {
  Object.defineProperty(this, 'make', {
    get: function() { return make; }
  });

  Object.defineProperty(this, 'year', {
    get: function() { return year; }
  });
}
```



- `Object.prototype.isPrototypeOf`
- `Object.create`
- `Object.getPrototypeOf`
- `Object.setPrototypeOf`



https://segmentfault.com/a/1190000003798438



### ES6中的继承



example: A <= B <= C



编译后的代码是怎样的



```
"use strict";

var _createClass = function() {
    function defineProperties(target, props) {
        for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }
    return function(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
    };
} ();

function _classCallCheck(instance, Constructor) {
    if (! (instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}

var Rectangle = function() {
    // constructor
    function Rectangle(height, width) {
        _classCallCheck(this, Rectangle);

        this.height = height;
        this.width = width;
    }
    // Getter

    _createClass(Rectangle, [{
        key: "calcArea",

        // Method
        value: function calcArea() {
            return this.height * this.width;
        }
    },
    {
        key: "area",
        get: function get() {
            return this.calcArea();
        }
    }]);

    return Rectangle;
} ();
```



对比强类型语言中的继承特性

with Java: abstract class, Interface

访问控制 public, private, protected

Java 多继承时推荐使用 Interface



## 试试多继承





## 多继承要解决的问题

1、instanceof 多态

2、override, protected

**3、Method Resolution Order**

4、循环依赖



https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch4.md#multiple-inheritance



Dojo多继承 http://driftcloudy.iteye.com/blog/909160

```
var A = declare(null, {
// constructor, properties, and methods go here
// ...
});
var B = declare(null, {
// constructor, properties, and methods go here
// ...
});
var C = declare([A, B], {
// constructor, properties, and methods go here
// ...
});
var D = declare(A, {
// constructor, properties, and methods go here
// ...
});
 
var a = new A(), b = new B(), c = new C(), d = new D();
 
console.log(a.isInstanceOf(A)); // true
console.log(b.isInstanceOf(A)); // false
console.log(c.isInstanceOf(A)); // true
console.log(d.isInstanceOf(A)); // true
```

dojo.declare https://github.com/dojo/dojo/blob/master/_base/declare.js#L554



### 间接多继承

很遗憾，Java 和 js 都没有支持多继承，

extend 一个类，其余 mixin 方式



## *优雅的继承

use mixin



Vue 中的 mixin



## 为什么不建议多继承

我们使用继承的时候，我们需要确信使用继承确实是有效可行的办法。那么到底要不要使用继承呢？《Think in Java》中提供了解决办法：问一问自己是否需要从子类向父类进行向上转型。如果必须向上转型，则继承是必要的，但是如果不需要，则应当好好考虑自己是否需要继承。

用组合的方式来解耦



## 总结



### 参考资料

https://docs.oracle.com/javase/tutorial/java/IandI/abstract.html



[dojo.declare](https://github.com/dojo/dojo/blob/master/_base/declare.js)

http://driftcloudy.iteye.com/blog/909160

http://blog.csdn.net/kittyjie/article/details/72828470

[The Python 2.3 Method Resolution Order](https://www.python.org/download/releases/2.3/mro/)

[ES6 Class Multiple inheritance](https://stackoverflow.com/questions/29879267/es6-class-multiple-inheritance)



[MDN for Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)

[ES6 中优雅的 mixin 式继承](https://www.h5jun.com/post/mixin-in-es6.html)

