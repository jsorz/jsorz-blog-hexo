---
title: JS中的“多继承”-(1)
category: javascript
tags: [javascript]
---

首先 javascript 中**不存在多继承**，并且也不推荐使用继承。如果你也这么认为的话，那笔者的观点也就写完啦 233333…. 如果还想回顾下 javascript 中“继承”的前世今生，以及对“多继承”的讨论，不妨看下去。

<!-- more -->

## 苦苦追求的语法糖

在ES6之前，在还没有使用 React, Vue 等框架之前，我们在做稍复杂的前端页面和组件时，会经常用模块化的思想去封装一些可复用的逻辑，会想着给 javascript 提供“类”的支持，再结合一些设计模式，就可以做出各种灵活的代码结构。

我们知道 javascript 中并**不存在 class**，存在的只是原型链，都是通过函数和 `prototype` 去封装一些东西来模拟“类”。可以说任何一个函数都可以被视为一个“类”，只要你愿意。

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

这样的代码想必都很面熟，借鉴了强类型语言中的“类”的概念，既然是类，它除了封装一些属性和方法，还需要做到可见性的控制。由于 javascript 中没有[可见性修饰符](#)，只能用闭包来模拟 public 与 private。虽然比起 Java 中的类还有很多不足，但至少做到了一些封装，而且通常我们还可以建立命名规范，约定下划线开头的属性名或方法名为私有的。



有了【封装】之后，我们就要考虑【继承】了。javascript 也没有继承的机制，都是使用 `prototype` 去模拟，实现方式有很多，出现了各种各样的“继承”方法。原型式继承、类式继承，甚至模拟`super`关键字，提供 `Class.extend()`、`this.super()` 等便利的用法，都是运用闭包和 `prototype` 实现的 Syntactic sugar。这也就是过去 [Prototype.js](http://prototypejs.org/learn/class-inheritance) 这样的库对前端产生的影响。



而至于【多态】，这是只在强类型语言中需要考虑的，当无法在编译时确定一个对象的类型时，只能在运行时确定一个函数要从哪儿去获取。常见的应用场景是：用父类型的引用去接收子类型的对象，使用父类型中定义的函数去统一操作不同子类的对象，并且子类中可以覆盖父类中的函数。正巧 javascript 的弱类型特征，不存在编译时要确定类型，天然支持多态。



### 到了ES5后

ES5有了`Object.create()`，让我们更便捷地使用原型继承，`Object.getPrototypeOf`、`Object.setPrototypeOf` 可以更自由地操控原型链。

```
var Book = function(title) {
  Object.defineProperty(this, 'title', {
    writable: false,
    value: title
  });
};

Book.prototype.getTitle = function() { return this.title; };

var EBook = function(link) {
  Object.defineProperty(this, 'link', {
    writable: false,
    value: link
  });
};

EBook.prototype = Object.create(Book.prototype, {
  download: {
    writable: false,
    value: function() { console.log('Start...'); }
  }
});
// 一定要修正 constructor
EBook.prototype.constructor = EBook;

// testing
var jsorz = new EBook('//jsorz.cn');
console.log(jsorz instanceof Book);
console.log(jsorz instanceof EBook);
console.log(jsorz.constructor === EBook);
console.log(jsorz.hasOwnProperty('getTitle') === false);
console.log(Object.getPrototypeOf(jsorz) === EBook.prototype);
console.log(Object.getPrototypeOf(jsorz).constructor === EBook);
```

注：`Object.getPrototypeOf` 返回的即图1中 `__proto__` 的指向。



### ES6中的继承

在ES2015中有了 `class` 语法糖，有了 `extends`、`super`、`static` 这样的关键字，更像强类型语言中的“类”了。

```
class Book {
  constructor(props) {
    this._title = props.title;
  }

  get title() { return this._title; }

  static staticMethod() {}

  toString() { return `Book_${ this._title }`; }
}

class EBook extends Book {
  constructor(props) {
    super(props);
    this._link = props.link;
  }

  set link(val) { this._link = val; }

  toString() { return `Book_${ this._link }`; }
}
```

上面的语法确实清晰简单了，我们再看下编译成ES5后的代码是怎样的~

```
var Book = function () {
  function Book(props) {
    _classCallCheck(this, Book);
    this._title = props.title;
  }

  _createClass(Book, [{
    key: "toString",
    // 省略...
  }, {
    key: "title",
    // 省略...
  }], [{
    key: "staticMethod",
    // 省略...
  }]);

  return Book;
}();

var EBook = function (_Book) {
  function EBook(props) {
    // 省略...
  }
  _inherits(EBook, _Book);

  _createClass(EBook, [{
    key: "toString",
    // 省略...
  }, {
    key: "link",
    // 省略...
  }]);

  return EBook;
}(Book);
```

示例生成的代码可以用 [Babel REPL](https://babeljs.io/repl/#?babili=false&browsers=&build=&builtIns=false&code_lz=MYGwhgzhAEBCD28DW0DeAoa1jwHYQBcAnAV2APiIAoAHI-GiASjUy2gIAsBLCAOgD6BbgRABTaAF5odBv2GixAbjYBfdGwDmYghxHiqLVNCI6SRXBx78h-5dHVtCYYcGjPXAWR2d4AE0M0RywKAGViblxNQONTAnNLAAMEZAEAEmMuXkEFcQdEpQd0R1BIGABRFJQxAA8CMVw_GCrWLBx8YjIKallGIzYsCBIaMR76PpV2K2yBEEiUaV7-OdwkSaKnHWgVpCoANzAQI2mbHaloA5BC4I54cKJI6OO4hOhkxCR0zOtBM9UCoqqIA&debug=false&forceAllTransforms=false&shippedProposals=false&circleciRepo=&evaluate=false&fileSize=false&lineWrap=true&presets=es2015%2Cstage-3&prettier=false&targets=&version=6.26.0&envVersion=) 查看，可以看到 ES6 提供的 `class` 语法真的是 Syntactic sugar，本质上与我们用 ES5 甚至更早时模拟“类”与继承如出一辙。其中重点的 `_inherits` 函数如下：

```
function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}
```



### 小结

javascript 很容易模拟一个“类”，并且可以一定程度上做到面向对象中的三大特性：封装、继承、多态。从最初去模拟一个“类”，到 ES5 提供更便捷的原型操控API，到 ES6 中提供更多“类”相关的关键字，都是在帮我们减小 javascript 中面向对象的使用成本，使它看起来像跟它没有半毛钱关系的 Java 语言。

虽然 javascript 中的“继承”并不是真正的继承，“类”也不是真正的“类”，相比 Java 肯定还有很多实现不了的地方，比如 abstract class、Interface 等，只能通过一些 tricky 的办法去模拟。因此 javascript 中所谓的“继承”，是为了方便程序员用面向对象的方式来组织代码。


