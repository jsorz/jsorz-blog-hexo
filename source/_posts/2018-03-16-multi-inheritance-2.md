---
title: JavaScript中的“多继承”(2)
category: javascript
tags: [javascript, es]
---

首先 JavaScript 中**不存在多继承**，并且也不推荐使用继承。如果你也这么认为的话，那笔者的观点也就写完啦 233333…. 如果还想回顾下 JavaScript 中“继承”的前世今生，以及对“多继承”的讨论，不妨看下去。

（接上一篇）

<!-- more -->

## 试试多继承

贪心是人之常情，有了“继承”后，我们就会想要“多继承”。即使在后端语言中，也没有几个语言能真正实现多继承，笔者只知道 C++ 和 python 提供了多继承的语法，而像 Java 只允许继承一个父类，但可以同时 `implements` 多个接口类，也算一种变相的多继承吧。

### 多继承要考虑的问题

多继承并没有想象的那么美好，首先是对 `instanceof` 提出了更高的要求

```
class A {}
class B {}
// 假定有支持多继承的语法
class C extends A, B {}
// 那么 C 的实例对象，应该同时也是 A 和 B 的 instance
let c = new C()
c instanceof C  // true
c instanceof A  // true
c instanceof B  // true
```

如上示例，在多继承中必须将所有的父类标识记录在子类中，才能让 `instanceof` 实现上面的效果。而 JavaScript 中只有 `prototype` 链，该死的还约束了一个对象只能指定一个 `prototype`，所以还得另外想办法去模拟 `instanceof`

这还不算啥，请看下一张图

<img src="/images/captures/20180316_diamond_inherit.png">

这是多继承中典型的问题，称为 Diamond Problem，当 A, B, C 中都定义了一个相同名称的函数时，而在 D 的实例对象中调用这个函数时，究竟应该去执行谁。。。



### 间接多继承

先退而求其次，我们借鉴了 Java 中的思路，实际只继承一个类，通过其他方式将其他类的功能融入。Java 中可以用 `Interface` 约束一个类应该拥有的行为，当然 JavaScript 也可以这么做，实现 interface 的语法糖，检查“类”中有没有重写 interface 中的所有函数。但这样的话，interface 除了做校验之用，没有实际意义，不如直接 mixin 的方式来的实在。

```
const mixinClass = (base, ...mixins) => {
  const mixinProps = (target, source) => {
    Object.getOwnPropertyNames(source).forEach(prop => {
      if (/^constructor$/.test(prop)) { return; }
      Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop));
    })
  };

  let Ctor;
  if (base && typeof base === 'function') {
    Ctor = class extends base {
      constructor(...props) {
        super(...props);
      }
    };
    mixins.forEach(source => {
      mixinProps(Ctor.prototype, source.prototype);
    });

  } else {
    Ctor = class {};
  }
  return Ctor;
};

class A {
  methodA() {}
}
class B {
  methodB() {}
}
class C extends mixinClass(A, B) {
  methodA() { console.log('methodA in C'); }
  methodC() {}
}

let c = new C();
c instanceof C  // true
c instanceof A  // true
c instanceof B  // false
```

这样就简单模拟了间接多继承，通过构造一个中间类，让中间类直接继承 A，并且 mixin 了 B 的原型成员，然后再让 C 去继承这个中间类。由于 B 是通过 mixin 方式浅拷贝了一份，`B.prototype` 并不在 C 的原型链上（`C.__proto__.__proto__`），所以 `c instanceof B` 为 false。

要想修正 instanceof，只能自己另外实现一套 `isInstanceOf()` 的逻辑，在继承时将所有的父类引用记录下来，再去比对。



### MRO算法

针对多继承考虑的第2个问题，前面提到的 Diamond Problem，需要引入一个定义。

Method Resolution Order (MRO) 指的是在继承结构中确定类的线性顺序，例如 `C => B => A` 表示 C 继承 B，B 继承 A，那么 C 的 MRO 就是 `C B A`，也就意味着当调用 C 实例中的一个函数时，会按照 `C B A` 的优先级顺序去“寻找”该函数。在单继承的结构中自然没有问题，而在多继承中 MRO 发挥着其作用。

常用的[C3算法](https://en.wikipedia.org/wiki/C3_linearization)就是用来计算 MRO，在 python 文档中有对其的完整描述，这里用一个例子简述下算法流程。

假设现在有这样的多继承结构

<img src="/images/captures/20180316_mro_example.png">

首先引入类的线性顺序的表示方法，在上图中可以看到 `B => Y => O` 这一部分是单继承的结构，显然 B 的 MRO 为 `B Y O`，记为 L(B) = BYO

然后还要引入几个符号，在 MRO 的线性顺序中，用 head 表示第一个元素，用 tail 表示余下部分。例如，`B Y O` 中的 head 就是 `B`，tail 则是 `Y O`。MRO 中只有一个元素，如图中的 O 元素，head 为`O`，tail 则是空。

接下来是最关键的，图中 A 的 MRO 记为 L(A(X, Y))，A(X, Y) 表示 A 同时继承了 X 和 Y，那么

L(A(X, Y)) = A + merge(L(X), L(Y), XY)

其中 merge 的规则如下

```
取出第一个序列的 head
如果，该 head 不在其它序列的 tail 中
	则把这个 head 添加到结果中并从所有的序列中移除它
否则，用下一个序列的 head 重复上一步
直到所有序列中的所有元素都被移除（或者无法找到一个符合的head）
```

最后我们来计算下上图中各个类的线性顺序

``` 
L(O) = O
L(X) = X + L(O) = XO
L(Y) = Y + L(O) = YO
L(A) = A + merge(L(X), L(Y), XY)
	 = A + merge(XO, YO, XY)
	 = AX + merge(O, YO, Y)
	 = AXY + merge(O, O)
	 = AXYO
L(B) = B + L(Y) = BYO
L(C) = C + merge(L(A), L(B), AB)
	 = C + merge(AXYO, BYO, AB)
	 = CA + merge(XYO, BYO, B)
	 = CAX + merge(YO, BYO, B)
	 = CAXB + merge(YO, YO)
	 = CAXBYO
```

上述多继承结构的 python 示例可参见 https://glot.io/snippets/ez5bqslav2  输出了 C 这个类的 MRO 即 `C A X B Y O`

当然C3算法也有 bad case，会导致上述的 merge 在中途失败，也就是无法求出 MRO 的 case。关于 MRO 的更多细节可参考 https://www.python.org/download/releases/2.3/mro/  总之不推荐设计出过于复杂的多继承结构 =_=



### 模拟多继承

有了上面的基础后，我们来模拟实现下多继承：

- 为每个“类”提供独立的 `isInstanceOf()` 函数以解决 `instanceof` 的问题
- 同时引入 Method Resolution Order (MRO) 的C3算法，将每个“类”的 MRO 线性序列存在 meta 数据中
- 将多继承中的第一个父类，使用原型链的方式继承，而剩下的父类则使用 mixin 的方式

```
const mixinProps = (target, source) => {
  Object.getOwnPropertyNames(source).forEach(prop => {
    if (/^(?:constructor|isInstanceOf)$/.test(prop)) { return; }
    Object.defineProperty(target, prop, Object.getOwnPropertyDescriptor(source, prop));
  })
};

const mroMerge = (list) => {
  if (!list || !list.length) {
    return [];
  }

  for (let items of list) {
    let item = items[0];
    let valid = true;

    for (let items2 of list) {
      if (items2.indexOf(item) > 0) {
        valid = false;
        break;
      }
    }

    if (valid) {
      let nextList = [];
      for (let items3 of list) {
        let _index = items3.indexOf(item);
        if (_index > -1) {
          items3.splice(_index, 1);
        }
        items3.length && nextList.push(items3);
      }
      return [item, ...mroMerge(nextList)];
    }
  }
  throw new Error('Unable to merge MRO');
};

const c3mro = (ctor, bases) => {
  if (!bases || !bases.length) {
    return [ctor];
  }

  let list = bases.map(b => b._meta.bases.slice());
  list = list.concat([bases]);

  let res = mroMerge(list);
  return [ctor, ...res];
};

const createClass = (parents, props) => {
  const isMulti = parents && Array.isArray(parents);
  const superCls = isMulti ? parents[0] : parents;
  const mixins = isMulti ? parents.slice(1) : [];

  const Ctor = function(...args) {
    // TODO: call each parent's constructor
    if (props.constructor) {
      props.constructor.apply(this, args);
    }
  };

  // save c3mro into _meta
  let bases = [superCls, ...mixins].filter(item => !!item);
  Ctor._meta = { bases: c3mro(Ctor, bases) };

  // inherit first parent through proto chain
  if (superCls && typeof superCls === 'function') {
    Ctor.prototype = Object.create(superCls.prototype);
    Ctor.prototype.constructor = Ctor;
  }

  // mix other parents into prototype according to [Method Resolution Order]
  // NOTE: Ctor._meta.bases[0] always stands for the Ctor itself
  if (Ctor._meta.bases.length > 1) {
    let providers = Ctor._meta.bases.slice(1).reverse();
    providers.forEach(provider => {
      // TODO: prototype of superCls is already inherited by __proto__ chain
      (provider !== superCls) && mixinProps(Ctor.prototype, provider.prototype);
    });
  }
  mixinProps(Ctor.prototype, props);

  Ctor.prototype.isInstanceOf = function(cls) {
    let bases = this.constructor._meta.bases;
    return bases.some(item => item === cls) || (this instanceof cls);
  }

  return Ctor;
};
```

接着来测试一下如图3中的多继承结构

```
const O = createClass(null, {});
const X = createClass([O], {});
const Y = createClass([O], {
  methodY() { return 'Y'; }
});
const A = createClass([X, Y], {
  testName() { return 'A'; }
});
const B = createClass([Y], {
  testName() { return 'B'; }
});
const C = createClass([A, B], {
  constructor() {
    this._name = 'custom C';
  }
});

let obj = new C();
console.log(obj.isInstanceOf(O)); // true
console.log(obj.isInstanceOf(X)); // true
console.log(obj.isInstanceOf(Y)); // true
console.log(obj.isInstanceOf(A)); // true
console.log(obj.isInstanceOf(B)); // true
console.log(obj.isInstanceOf(C)); // true

console.log(obj.testName());
console.log(obj.methodY());
```

以上代码仅供学习，还有很多不足，比如构造函数中只能调用自身的 `constructor` 函数，无法调用父类的`constructor`。这是由于 JavaScript 限制了无法通过 `X.prototype.constructor.apply()` 的方式调用其他类的构造函数（`constructor` 只能在 new 的时候调用），想绕开这个问题的话，只能换个函数名，叫 initializtion、init 之类的名字都行。

[demo 代码在这里](https://glot.io/snippets/ez7tm0d4up)，多改变下参数试试，尝试理解前面所说的 C3 MRO 算法。



### 存在的问题

上面的代码，为了模拟多继承，只将第一个父类放入了子类的原型链中，而其他父类只能通过 mixin 的方式将其 prototype 中的属性拷贝到子类的 prototype 中。这受限于 JavaScript 原型链的机制，即图1中 `__proto__` 只能指向一个目标。所以既然这样实现的，肯定是与真正的多继承相悖的，像 C++ 中有[虚函数表](https://en.wikipedia.org/wiki/Virtual_method_table)的机制，在多继承中调用函数时，会去查表找出真正的函数地址。而我们模拟出的 JavaScript 多继承，是将所有父类中的函数都揉到了一个 prototype 中（只不过按照 MRO 优先级顺序来依次揉入）。

仔细看上面代码的话会发现，`c.testName()` 输出的与 Method Resolution Order 中所述的算法不符。在那一节中，我们知道 C 的 MRO 应该为 `C A X B Y O`，示例代码中按理来说应该优先调用 A 中的 `testName()` 函数，实际却输出了"B"......卧槽，这代码有毒的吧？？

```
  // inherit first parent through proto chain
  if (superCls && typeof superCls === 'function') {
    Ctor.prototype = Object.create(superCls.prototype);
    Ctor.prototype.constructor = Ctor;
  }

  // mix other parents into prototype according to [Method Resolution Order]
  // NOTE: Ctor._meta.bases[0] always stands for the Ctor itself
  if (Ctor._meta.bases.length > 1) {
    let providers = Ctor._meta.bases.slice(1).reverse();
    providers.forEach(provider => {
      // TODO: prototype of superCls is already inherited by __proto__ chain
      (provider !== superCls) && mixinProps(Ctor.prototype, provider.prototype);
    });
  }
```

注意代码里有句 `(provider !== superCls)` 的过滤，你可以把它去了再试下 demo。。笔者这里也纠结，因为 `superCls` 是第一个父类，已经在原型链上继承了，而在根据 MRO 顺序 mixin 其他父类时，按理应该将第一个父类过滤掉。然而一旦加上了 `(provider !== superCls)` 条件后，其他父类 prototype 上的属性都被拷贝到了 `Ctor.prototype` 上，而第一个父类中的原型却在 Ctor 的原型链上，显然 `Ctor.prototype` 上的函数优先级更高。

那我们将这个条件干掉！然而仍有 bad case。。 因为它将所有父类中的 prototype 都拷贝到了自己身上（它明明不应该有的），而当别人再继承它时，别人会误以为它定义了那么多函数，就会出现函数覆盖时的顺序与 MRO 计算出的顺序不一致的问题了。

归根到底还是“没有查函数表”的锅！或者我们在使用方式上做强约束，多继承中的所有函数调用都必须经过统一的形如 `invoke(methodName, args)` 的接口，在 invoke 时根据 MRO 的优先级顺序，依次查找有无 methodName 的函数，再真正调用。



## 为什么不建议继承

说了那么多，笔者的体会是**不要想着继承**，**不要想着继承**，**不要想着继承**。。。

JavaScript 本身就不是面向对象的语言，干嘛要让它做它不擅长的事情 =_=  虽然语法糖已经提供了“类”的支持，那是照顾有面向对象想法的人，但它本质上不同于其他语言中的继承。不要把他人的宽容当作放任的理由，能模拟继承就不错了，就别再惦记“多继承”了。

再回过头来想一想，我们为什么需要继承？继承是一种强耦合关系，到底是否有必要用继承，可以考虑下在应用场景中是否需要用父类型去接收子类型的实例，即子类向父类的向上转型。在 JavaScript 中不会出现这样的需求，应该更多使用组合的方式以代替继承，以及函数式编程也许是更好的方案。



## 总结

本文从 JavaScript 对“类”的语言机制出发，回顾了随着语言的进步，“继承”在 JavaScript 中变得越来越方便。然后讨论了“多继承”时需要考虑的问题，介绍了 Method Resolution Order (MRO)，并尝试在 JavaScript 中模拟“多继承”。

然而，JavaScript 本质上不存在继承的概念，这种通过 prototype 模拟出来的“多继承”不会很完美，体验上比原生支持继承或多继承的语言要差的多。因此不要想着多继承，JavaScript 中也不建议使用继承。



【2018.4.4更新】

看了知乎网友的评论，推荐了一篇文章 [How to use classes and sleep at night](https://medium.com/@dan_abramov/how-to-use-classes-and-sleep-at-night-9af8de78ccb4)，读完后更是觉得以前自己使用多层继承（非多继承）是多么 naive 了，文中主要给出了这几点建议：

- 对外提供API时不要直接暴露 class。因为这样你不知道别人会怎么用你的类，会让你今后升级API时出现很多 break changes
- 不要使用多层继承。嗯…我在以往的工作中就这么做，最后陷入了找 bug 的坑中，都不知道真正执行的函数在哪一层
- 不要调用 `super` 中的函数，直接覆盖它们。again...我在以往的工作中也犯了同样的错误，为了重用 super 中的逻辑，但又有部分逻辑不同，不得不继续拆分更细粒度的函数，以满足可以复用 `super`。结果一样，最后陷入了找 bug 的坑中。。。
- 不建议对外提供类，即使不得以这么做，提供方也要做好类型校验和对“可见性”的保护，防止使用方滥用。要提供更加明确的API，让使用方传入一个函数作为参数来满足自定义需求，而不是让使用方来 override
- 尝试入坑 Functional Programming



Good Night

### 参考资料

[You-Dont-Know-JS](https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch4.md)

[Java Doc - Polymorphism](https://docs.oracle.com/javase/tutorial/java/IandI/polymorphism.html)

[Python Doc - MRO](https://www.python.org/download/releases/2.3/mro/)

[C3 linearization](https://en.wikipedia.org/wiki/C3_linearization)

[Class declare in dojo](https://github.com/dojo/dojo/blob/master/_base/declare.js#L554)


