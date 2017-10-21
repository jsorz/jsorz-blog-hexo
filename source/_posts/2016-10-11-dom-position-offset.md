---
title: 元素position与offset
date: 2017-10-11 14:28:30
category: css
tags: [css, 常用片段]
---

获取元素相对于页面左上角的位置，是比较常用的需求。比如将一个浮层元素定位到当前操作的元素附近，就需要计算当前操作的元素相对于页面左上角的位置，然后将浮层元素也绝对定位到该位置附近。

<!-- more -->

### offsetParent 法

```
function getOffset(el) {
  let top = 0;
  let left = 0;
  let target = el;

  while (target.offsetParent) {
    top += target.offsetTop;
    left += target.offsetLeft;
    target = target.offsetParent;
  }
  return { top: top, left: left };
}
```

思路就是取元素`offsetTop`和`offsetLeft`，然后使用`offsetParent`逐层向上直到根元素，这样就取出了相对于页面左上角的偏移。

<img src="/images/captures/20171011_dom_position.jpg">

###clientRect 法

[getBoundingClientRect](https://developer.mozilla.org/zh-CN/docs/Web/API/Element/getBoundingClientRect) 取出的是元素相对于视窗的距离，那么再加上页面滚动条的偏移，就可以求出元素相对于页面左上角的距离。

```
function getOffset(el) {
  if (el === document.documentElement) {
    return { top: 0, left: 0 };
  }
  
  const box = el.getBoundingClientRect();
  let top = 0;
  let left = 0;

  if (window.pageYOffset !== undefined) {
	top = Math.floor(box.top + window.pageYOffset);
    left = Math.floor(box.left + window.pageXOffset);
  }
  else {
  	// 有个 bad case 即当HTML或者BODY元素有 border width 时，会有偏差
  	top = Math.floor(box.top) + Math.max(doc.documentElement.scrollTop, doc.body.scrollTop);
    left = Math.floor(box.left) + Math.max(doc.documentElement.scrollLeft, doc.body.scrollLeft);

    top -= doc.documentElement.clientTop;
    left -= doc.documentElement.clientLeft;
  }
  return { top: top, left: left };
}
```

可见`getBoundingClientRect`方法比取`offsetParent`效率要高的多，并且搭配`window.pageYOffset`代码更简单。

### jquery 法

使用 jquery 里的`offset` 和 `position`，可分别获取相对于页面左上角和相对于父元素的偏移。

源码参见[https://github.com/jquery/jquery/blob/1.7.2/src/offset.js#L7](https://github.com/jquery/jquery/blob/1.7.2/src/offset.js#L7)，而在1.9版本中简化了其实现[https://github.com/jquery/jquery/blob/1.9.1/src/offset.js#L1](https://github.com/jquery/jquery/blob/1.9.1/src/offset.js#L1)

对比下 baidu/tangram 库中的相应实现 

```
baidu.dom.extend({
    offset: function(){
        
        function setOffset(ele, options, index){
            var tang = tang = baidu.dom(ele),
                position = tang.getCurrentStyle('position');
            position === 'static' && (ele.style.position = 'relative');
            var currOffset = tang.offset(),
                currLeft = tang.getCurrentStyle('left'),
                currTop = tang.getCurrentStyle('top'),
                calculatePosition = (~'absolute|fixed'.indexOf(position)) && ~('' + currLeft + currTop).indexOf('auto'),
                curPosition = calculatePosition && tang.position();
            currLeft = curPosition && curPosition.left || parseFloat(currLeft) || 0;
            currTop = curPosition && curPosition.top || parseFloat(currTop) || 0;
            baidu.type('options') === 'function' && (options = options.call(ele, index, currOffset));
            options.left != undefined && (ele.style.left = options.left - currOffset.left + currLeft + 'px');
            options.top != undefined && (ele.style.top = options.top - currOffset.top + currTop + 'px');
        }
        
        return function(options){
            if(options){
                baidu.check('^(?:object|function)$', 'baidu.dom.offset');
                for(var i = 0, item; item = this[i]; i++){
                    setOffset(item, options, i);
                }
                return this;
            }
            var ele = this[0],
                doc = this.getDocument(),
                box = {left: 0, top: 0},
                win, docElement;
            if(!doc){return;}
            docElement = doc.documentElement;
            if(!baidu._util_.contains(docElement, ele)){return box;}
            (typeof ele.getBoundingClientRect) !== 'undefined' && (box = ele.getBoundingClientRect());
            win = this.getWindow();
            return {
                left: box.left + (win.pageXOffset || docElement.scrollLeft) - (docElement.clientLeft || 0),
                top: box.top  + (win.pageYOffset || docElement.scrollTop)  - (docElement.clientTop  || 0)
            };
        }
    }()
});
```

