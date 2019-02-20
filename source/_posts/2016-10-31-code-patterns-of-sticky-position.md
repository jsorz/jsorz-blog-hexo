---
layout: post
title: "常用模式片段之 sticky position"
category: css
tags: [css, 常用片段]
---

以前面试当被问到 css position 能取哪些值时，只回答了 relative absolute fixed 外加 static inherit，在 MDN 上可以看到有个新增的实验性的 [position sticky](https://developer.mozilla.org/en-US/docs/Web/CSS/position#sticky)

<!-- more -->

### sticky 定义

就是将某个元素固定在某个位置，乍一看和 fixed 定位有点像，但它们有以下不同

- `fixed`是相对于 viewport 来定位，而`sticky`是相对于该元素在流中的 flow root（BFC）和 containing block（最近的块级祖先元素）定位。
- `fixed`会使元素脱离文档流，而`sticky`则不会，后续元素的位置仍按照未定位时的位置来确定。

[简单的demo](https://jsfiddle.net/af8ph43v/6/)

<iframe width="100%" height="300" src="//jsfiddle.net/af8ph43v/6/embedded/result,html,css/" allowfullscreen="allowfullscreen" frameborder="0"></iframe>

### sticky 踩坑

使用时的注意点

- 具有sticky属性的元素，其父级高度必须大于sticky元素的高度
- sticky元素的底部，不能和父级底部重叠
- sticky元素的父级不能含有 `overflow:hidden` 和 `overflow:auto` 属性
- 必须具有top或bottom属性，如果同时定义了top和bottom，top胜
- sticky元素仅在他父级容器内有效，超出容器范围则不再生效了


浏览器兼容性

- Chrome已经不再支持sticky属性
  - 【2017更新】[Chrome 56 开始支持了](http://caniuse.com/#search=sticky)
- Safari 从 6.1开始支持，但表现也不太完美
- Firefox 从版本 32开始支持了
- IE一直不支持，放弃吧...


### js 实现

以前没有`position: sticky`的时候，都必须用 js 监听滚动并且动态改变元素定位方式，才能实现相应的效果

具体实现思路是

- 保存元素初始的位置，判断当前距离 viewport 的位置
- 如果`<=`定义的 top 值，则将元素改为`fixed`定位
  - 在元素上挂个 data-sticky 作为标记
  - 并且在文档流中插入一个与之同样大小的占位元素
- 否则恢复元素初始的位置，删除 data-sticky 标记，并删除占位元素

现有 jquery 插件

- [jquery.pin](http://webpop.github.io/jquery.pin/)
- [fixed-sticky](https://github.com/filamentgroup/fixed-sticky)


### 判断浏览器是否支持sticky

```js
function supportSticky() {
  var _supportCSS = function(property, value){
    var el = document.createElement('i');
    el.style[property] = value;
    var r = el.style[property];
    el = null;
    return r === value;
  };

  var supportVals = ['-webkit-sticky', '-ms-sticky', 'sticky'].filter(function(item){
      return _supportCSS('position', item);
  });
  return supportVals.length ? supportVals[0] : null;
}
```

