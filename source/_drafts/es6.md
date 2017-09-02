## 变量

### let 

- 不存在变量提升
	- 暂时性死区
- 不允许重复声明
- 与顶层对象的属性脱钩
	- `let a = 1` 不会挂到 `window` 上

### 块级作用域

- ES5 只有全局作用域和函数作用域
- ES6 允许块级作用域的任意嵌套
- *块级作用域的出现，实际上使得获得广泛应用的立即执行函数表达式（IIFE）不再必要了*
- ES6 明确允许在块级作用域之中声明函数，*但在浏览器的ES6实现中仍把块级作用域的函数声明当作`var`处理*，建议写成函数表达式。

### const

- 只在声明所在的块级作用域内有效，特性同`let`
- const 声明变量时必须复制，以后不能赋值
	- const 实际上保证的，并不是变量的值不得改动，而是变量指向的那个内存地址不得改动。
	- 对于基础数据类型，const 指向的就是其值；而对于对象类型，const 指向其引用地址，对象的地址不可改变，但对象本身的属性值仍可以改。
	- 如果必须将对象冻结（地址和值都不能改），应该使用`Object.freeze`

### 解构赋值

#### 数组解构形式

```
let [x, y, ...z] = ['a'];
x // "a"
y // undefined
z // []
```

- 只要某种数据结构具有 Iterator 接口，都可以采用数组形式的解构赋值。

```
function* fibs() {
    let a = 0;
    let b = 1;
    while (true) {
        yield a;
        [a, b] = [b, a + b];
    }
}

let [first, second, third, fourth, fifth, sixth] = fibs();
sixth // 5
```

- 解构赋值允许指定默认值，默认值生效的条件是：数组成员的值严格等于`undefined`

```
let [x = 1] = [undefined];
x // 1

let [x = 1] = [null];
x // null
```

#### 对象解构形式

```
let { foo: baz } = { foo: "aaa", bar: "bbb" };
baz // "aaa"
foo // error: foo is not defined
```

- 默认值生效的条件是：对象的属性值严格等于`undefined`

```
var {x = 3} = {x: undefined};
x // 3

var {x = 3} = {x: null};
x // null
```

- 如果要将一个已经声明的变量用于解构赋值，必须非常小心。因为 JavaScript 引擎会将`{x}`理解成一个代码块，从而发生语法错误。

- 解构赋值的规则是，只要等号右边的值不是对象或数组，就先将其转为对象。由于`undefined`和`null`无法转为对象，所以对它们进行解构赋值，都会报错。

- 常用场景：`let { log, sin, cos } = Math;`

#### 函数参数的解构赋值

```
[[1, 2], [3, 4]].map(([a, b]) => a + b);
// [ 3, 7 ]

[1, undefined, 3].map((x = 'yes') => x);
// [ 1, 'yes', 3 ]
```

#### 变量解构赋值的用途

- 提取对象数据（或用于遍历数据结构）
- 函数参数的映射及默认值
- 输入模块的指定方法


## 字符串的扩展

- ES6为字符串添加了`Iterator `接口，使得字符串可以被`for...of`循环遍历。

- 新增：`includes()`, `startsWith()`, `endsWith()`, `repeat()`

### 模板字符串



## 正则的扩展

TODO

