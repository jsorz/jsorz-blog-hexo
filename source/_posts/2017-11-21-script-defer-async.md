---
title: 脚本defer与async
category: 开发
tags: [浏览器]
---

在之前[一篇笔记](/blog/2017/04/notes-of-browser-displaying-a-page.html)中写到：

- defer 源自IE，保证执行顺序，都会到 domReady 后再执行
- async 现代标准，不保证执行顺序，什么时候下载完就什么时候执行

现在就来具体展开解释下~

<!-- more -->

### MDN介绍

defer

> This Boolean attribute is set to indicate to a browser that the script is meant to be executed after the document has been parsed, but before firing `DOMContentLoaded`. This attribute must not be used if the `src` attribute is absent (i.e. for inline scripts), in this case it would have no effect. To achieve a similar effect for dynamically inserted scripts use `async=false` instead. Scripts with the `defer` attribute will execute in the order in which they appear in the document.

async

> A boolean attribute indicating that the browser should, if possible, execute the script asynchronously. This attribute must not be used if the `src` attribute is absent (i.e. for inline scripts). If it is included in this case it will have no effect. 
>
> Dynamically inserted scripts execute asynchronously by default, so to turn on synchronous execution (i.e. scripts execute in the order they were loaded) set `async=false`

### 划重点

- `defer` 与 `async` 不适用于内联脚本，浏览器直接无视这个属性
- 没有 `defer` 或 `async` 时，浏览器遇到 `<script>` 就会立即加载并执行指定的脚本，“立即”指的是它是一个**同步**的过程，它会中断后续 html 文档的解析（直到 `<script>` 执行完后）
- 有 `async` 时，`<script>` 的加载与执行不会阻塞后续 html 文档的解析和渲染，即 `<script>` 是异步的、并行的。
- 有 `defer` 时，`<script>` 的加载也是与后续 html 文档的处理并行的，但是 `<script>` 的**执行是在所有文档解析完成之后**，且 `DOMContentLoaded` 事件之前才执行。

### 一图流

<img src="/images/captures/20171121_scripting.jpg">

需要补充说明的是：

- 不管是什么 script，它执行时（非加载）一定是会阻塞 html 解析的，因为浏览器不知道 script 里有没有 `document.write` `document.append` 这样的改变文档结构的操作，所以浏览器肯定需要停下来等 script 执行完再继续解析文档。
- 当有多个 `defer` 脚本时，它们最后执行时是按照加载时的顺序执行的
- 而多个 `async` 脚本时，无法保证顺序，它们是按照**”谁先加载完，就谁先执行“**的规则

### 应用场景

- 首先养成好习惯，`<script>` 尽量都插在 `<body>` 的最后
- 脚本的**并行**加载，可用来加快首屏显示，当依赖多个外部脚本时，效果就比较明显
- 一些动态插入的 `<script>` 比如 pollyfill 之类的，可以使用 `defer`
- 而一些不会与其他任何脚本发生依赖的 `<script>`，则 `async` 会更适合

