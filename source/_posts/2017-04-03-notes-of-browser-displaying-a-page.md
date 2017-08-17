---
title: 浏览器渲染原理 (听课笔记)
category: 开发
tags: [浏览器]
---

这也是公司培训的听课笔记，关于浏览器渲染过程中各个阶段的技术细节，整理的范围比较广，都列了一些点，可作为今后学习这块的提纲。

<!-- more -->

资源下载
--------

`<script>` & `<link>`

- css未下载完前，页面不会显示内容（为了体验）
- js未下载完前，是可以正常显示页面的

服务器端 Response.Flush()

- 分块传输，让客户端充分利用下载的间隙做解析，分块解析

document.write

- 页面渲染完后调用它，会使页面变成空白
- 【重要】document.write 会使浏览器重新解析DOM树，禁止使用

new Image().src

- 唯一不用添加元素就能发请求的办法
- 常用于发送日志
- 有些浏览器会报错，因为返回类型不是图片

defer VS async

- defer 源自IE，保证执行顺序，都会到 domReady 后再执行
- async 现代标准，不保证执行顺序，什么时候下载完就什么时候执行

资源优先级

- link[rel=stylesheet] / script 第一优先级（没有就没法看）
- object / img / iframe 第二优先级（是页面内容的一部分）
- link[rel=prefetch] 预加载（与当前页面没有关系）

脚本依赖

- 下载阻塞 VS 执行阻塞
- 执行阻塞可以并行下载，只需保留执行的顺序，效率更高


### Connection

并行度

- 现代浏览器资源下载并行度是`6`，旧的IE上是`4`
- 服务器压力 VS 客户端效率
- 比如

Socket重用

- TCP三次握手的时间与客户端带宽没有关系
- Connection: keep-alive 保证TCP连接不关闭
- 然后何时能够知道文件下载完了
    - Content-Length: 告诉你多长就读多长
    - Transfer-Encoding: chuncked 分块，最后一块都是0，表示下载完了

正确性保证

- Content-MD5 意义也不是很大

断点续传

- Accept-Range 告诉服务器我要哪段的数据，也可用于多线程下载
- Content-Range


### BS架构的精髓 - 缓存

- 补丁机制 胜过CS软件
- 验证型缓存：去问服务器是不是最新的，会有个请求，但省去了下载这个资源
    - Last-Modified & If-Modified-Since / If-Unmodified-Since
    - ETag & If-Match / If-None-Match
    - If-Range
- 非验证型缓存：完全不去问服务器，服务器更新了本地也不会知道
    - Cache-Control
    - Expires
- 缓存失效
    - Vary / Via / Date / Age
    - 比如现在是个代理服务器，Chrome请求资源缓存下来后，IE再请求时要不要使用缓存，通过 Vary 指定

缓存年龄计算

- age_value
- date_value
- 缓存过期计算

max-age=0 VS no-cache 区别

- max-age=0：是用于验证型缓存的，相当于告诉服务器禁止非验证型缓存，
- no-cache：禁止任何缓存

### 小结

- http的超链接特性注定资源之间有关联的依赖
- 外部资源位置、类型不同，影响下载时机
- Response.Flush 对下载的影响
- 缓存机制复杂但完善



页面解析
--------

字符串 --> 序列化 --> 转义 --> 标签匹配

脚本执行会增加解析的回溯

- DOM 结构的变化
- document.write 会使浏览器解析过程回溯到序列化的状态


### CSS计算

- 元素 - 匹配样式
- 耗内存 & 耗CPU

- Webkit 特定条件下样式共享（节省内存）
    - 鼠标状态相同
    - 没有id
    - class 和标签名相同
    - ....

- 样式计算的过滤（省CPU）
    - 以最后选择器为依据
    - 将css规则按最右为 id, class, tag, general 分组
    - 属性选择器也会归到 general 组里，因此效率低

- CSS层级
    - 来源层级
        - 浏览器UA样式
        - 用户样式
        - 作者样式
        - 作者样式 !important
        - 用户样式 !important
    - 样式层级
        - 1, 1, 1, 1 算法
        - inline(0/1), count(id), count(attribute), count(tag)
        - 从左到右按位比，数字大就胜出，直接结束比较

### Render Tree

- 元素没有渲染对象
    - head / meata / script
- 元素有多个渲染对象
    - html 会包含滚动条
    - li 会包含前面的小圆点
    - select
    - input[type=file]
- 通过CSS改变渲染对象
    - ::before / ::after
    - display: none
- js 控制DOM树，css 控制渲染树



布局
--------

- 流布局
- HTML三条流
    - 文档流、浮动流、定位流
- 其他因素
    - display: list-item
    - display: run-in

- table布局
    - display: table / inline-table / table-row / ....

- 坐标系
    - 前端中都以左上角为 0,0 点，右|下 为正坐标
    - 地图是以左下角为 0,0 点

- 布局是个递归过程
- 流布局可自左向右、自上而下进行，流中靠后的元素不会影响流中靠前的元素的布局（无回溯）
- table布局需要回溯才能够完成（知道每一个单元格的大小，才能完成整个布局）
- 流式布局特点是无论如何后面元素都不会影响前面，例如`ol`中四位数、五位数的预留位置不变，浏览器直接暴力地留了3位数的空间

- 全局reflow
    - 整个 Render Tree 全部重新计算布局
    - 全局布局样式变更：body {} / 添加新样式表
    - 窗口大小变化
- 局部Reflow
    - 仅标识为 needLayout / dirty 的渲染元素计算布局
    - Render Tree 中插入新的渲染元素
    - 渲染元素属性比拿货
- Reflow 会引起另一个 Reflow：比如 Reflow 导致滚动条位置变化

- 同步Reflow
    - 全局Reflow通常同步进行
    - 读取 offsetWidth / offsetHeight 等属性，会产生1次reflow
        - 禁止在循环中读取 offsetWidth / offsetHeight
- 异步Reflow
    - 局部Reflow通常异步进行
    - FireFox: Reflow任务进入线程Queue，任务调度器负责执行
    - Webkit: 定时器遍历Render Tree，布局所有 needLayout 对象

- Reflow任务可合并，一次脚本执行过程中多个样式修改仅做1次Reflow，但有limit（大约100~200个）
- 手动Reflow
    - 把元素先remove，改完一堆样式后再append进去
    - 循环中使用 fragment

- 文字布局
    - text-align: justified
    - white-space: nowrap / pre / pre-wrap
    - overflow: hidden / visible
- 换行计算
    - 每行一个line-box负责渲染
    - 当需要换行时，通知父元素....


渲染
--------

- transform / filter / z-index / color / visibility ...
- Reflow VS Repaint：display none VS visibility hidden

渲染顺序（CSS2）

- background color
- background image
- border
- children
- outline

渲染计算的优化

- firefox: display list
- webkit: rectangle storage
- chrome 的 Repaint 在独立进程中
