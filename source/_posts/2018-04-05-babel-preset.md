---
title: babel preset ≠ polyfill
category: javascript
tags: [es]
---

之前一直无脑用着 cli 脚手架，用着默认生成的配置，没有去仔细看 Babel 文档。直到最近接入了前端报错监控后，才发现了许多问题。这里整理下关于 babel preset 与 polyfill 的一些点

<!-- more -->

## ES6

ES6 既是一个历史名词，也是一个泛指，含义是 ES5.1 版以后的 JavaScript 的下一代标准，涵盖了 ES2015、ES2016、ES2017 等等。—— 引自[ECMAScript 6 入门](http://es6.ruanyifeng.com/)

> ES6 的第一个版本，于 2015 年 6 月发布了，正式名称就是《ECMAScript 2015 标准》（简称 ES2015）。2016 年 6 月，小幅修订的《ECMAScript 2016 标准》（简称 ES2016）如期发布，这个版本可以看作是 ES6.1 版，因为两者的差异非常小（只新增了数组实例的`includes`方法和指数运算符），基本上是同一个标准。根据计划，2017 年 6 月发布 ES2017 标准。

语法提案的 5 个阶段

- Stage 0 - Strawman（展示阶段）
- Stage 1 - Proposal（征求意见阶段）
- Stage 2 - Draft（草案阶段）
- Stage 3 - Candidate（候选人阶段）
- Stage 4 - Finished（定案阶段）



## Babel plugins

1、babel 6.x 之后取消了供浏览器直接使用的版本（之前是 browser.js，可以在浏览器中对 ES6 代码进行转换，但很低效），现在要求必须在 build 过程将 ES6 转换好。

2、babel 根据 `.babelrc` 文件的约定来工作，babel 默认是啥都不做的，必须指定各种 plugins，并且通常一个 plugin 只做一件事。比如 `transform-es2015-for-of` 就只做 `for…of…` 语法的处理。非严格地来说，这种处理我们也称之为“编译”。

3、由于 ES6 涉及的语法糖非常多，而且有些还只在特定 stage 的提案中，所以需要 presets 来约定一个 plugins 的集合，免去我们配置一大堆 plugins。



## Babel presets

[ES2015 preset](http://babeljs.io/docs/plugins/preset-es2015/)：也就是我们常说的 ES6 相关方法，包含以下 plugins

- check-es2015-constants // 检验const常量是否被重新赋值
- transform-es2015-arrow-functions // 编译箭头函数
- transform-es2015-block-scoped-functions // 函数声明在作用域内
- transform-es2015-block-scoping // 编译const和let
- transform-es2015-classes // 编译class
- transform-es2015-computed-properties // 编译计算对象属性
- transform-es2015-destructuring // 编译解构赋值
- transform-es2015-duplicate-keys // 编译对象中重复的key，其实是转换成计算对象属性
- transform-es2015-for-of // 编译for...of
- transform-es2015-function-name // 将function.name语义应用于所有的function
- transform-es2015-literals // 编译整数(8进制/16进制)和unicode
- transform-es2015-modules-commonjs // 将modules编译成commonjs
- transform-es2015-object-super // 编译super
- transform-es2015-parameters // 编译参数，包括默认参数，不定参数和解构参数
- transform-es2015-shorthand-properties // 编译属性缩写
- transform-es2015-spread // 编译展开运算符
- transform-es2015-sticky-regex // 正则添加sticky属性
- transform-es2015-template-literals // 编译模版字符串
- transform-es2015-typeof-symbol // 编译Symbol类型
- transform-es2015-unicode-regex // 正则添加unicode模式
- transform-regenerator // 编译generator函数

[ES2016 preset](https://babeljs.io/docs/plugins/preset-es2016/)：只将 ES2016 中新出现的语法转换成 ES2015 的写法

- transform-exponentiation-operator // 编译幂运算符

[ES2017 preset](https://babeljs.io/docs/plugins/preset-es2017/)：只将 ES2017 中新出现的语法转换成 ES2016 的写法

- syntax-trailing-function-commas // function最后一个参数允许使用逗号
- transform-async-to-generator // 把async函数转化成generator函数



此外，还有用于支持 React 的 [React preset](https://babeljs.io/docs/plugins/preset-react/)，还有 [Env preset](https://babeljs.io/docs/plugins/preset-env/) 用来根据你需要支持的浏览器环境来决定到底需要引入多少 plugins，浏览器支持度的细节可[参考这里](https://github.com/babel/babel-preset-env/blob/master/data/plugins.json)，以及 [compat-table](https://kangax.github.io/compat-table/es6/)



同前面列出的语法提案的 5 个阶段，也有根据 stage 划分的 preset，stage 4 指已 Finished 的部分，然而没有 `stage-4` 的 preset，因为它等同于 `['es2015', 'es2016', 'es2017']` 的 presets。

[Stage 3 preset](http://babeljs.io/docs/plugins/preset-stage-3/)

- transform-object-rest-spread // 编译对象的解构赋值和不定参数
- transform-async-generator-functions // 将 async generator function 和 for await 编译为 es2015 的 generator
- 注：trailing-commas, async, exponentiation will be removed in the next major since they are stage 4 already

[Stage 2 preset](http://babeljs.io/docs/plugins/preset-stage-2/)

- [syntax-dynamic-import](http://babeljs.io/docs/plugins/syntax-dynamic-import/)
- transform-class-properties // 编译静态属性(es2015)和属性初始化语法声明的属性(es2016)

[Stage 1 preset](http://babeljs.io/docs/plugins/preset-stage-1/)

- transform-export-extensions // 编译额外的exprt语法，如 `export * as ns from 'mod'` 细节可以[参考这里](https://link.zhihu.com/?target=https%3A//github.com/leebyron/ecmascript-more-export-from)
- 注：transform-class-constructor-call 在 Babel7 中会被移除

[Stage 0 preset](http://babeljs.io/docs/plugins/preset-stage-0/)

- transform-do-expressions // 编译do表达式
- transform-function-bind // 编译bind运算符，也就是::



由于 stage 0 ~ 4 是语法提案从开始到定案的过程，因此 stage 0 会包含更多的语法糖，stage 4 => 3 => 2 => 1 => 0 是逐渐增量的过程。



## plugins VS presets

有些 plugins 是 presets 中没有提供的，这时就配合着使用，需要单独引入 plugins

- [transform-runtime](https://babeljs.io/docs/plugins/transform-runtime/) 强烈推荐
- [transform-remove-console](https://babeljs.io/docs/plugins/transform-remove-console/)

plugins / presets 编译顺序

- plugins 优先于 presets 进行编译。
- plugins 按照数组的 index **增序**进行编译。
- presets 按照数组的 index **倒序**进行编译（因为作者认为大部分人会把 presets 写成 `["es2015", "stage-0"]` ）



## Babel polyfill

1、Babel 默认只转换新的 JavaScript 句法（syntax），而**不转换新的 API**。比如`Set`、`Maps`、`Proxy`、`Reflect`、`Symbol`、`Promise` 等全局对象，以及在 ES5 全局对象上新增的方法（如 `Array.from`） Babel 不会转码这些方法，必须使用 babel-polyfill，为当前环境提供一个垫片。

2、Babel 默认不转码的 API 非常多，详细清单可以查看 `babel-plugin-transform-runtime` 模块的 [definitions.js](https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-runtime/src/definitions.js) 文件。

3、polyfill 的使用姿势，有以下3种



| 使用方式                                     | 优点   | 缺点                           |
| ---------------------------------------- | ---- | ---------------------------- |
| 在`<script>`前插入 babel-polyfill 的CDN文件     | 大而全  | 打包过程无法参与，无法做 tree shaking 优化 |
| 在 webpack entry 中第一个插入 babel-polyfill    | 大而全  | 打包后文件体积增大                    |
| 在入口文件引入 [core-js](https://github.com/zloirock/core-js#commonjs) 自行取所需 | 最小化  | 以后会不断追加所需，容易遗漏               |

