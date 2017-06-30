---
layout: post
title: "常用模式片段之 sticky position"
category: css
tags: [css, 常用片段]
published: false
---


[position sticky 定义](http://www.ghugo.com/position-sticky-how-to-use/)

- 具有sticky属性的元素，其父级高度必须大于sticky元素的高度

- sticky元素的底部，不能和父级底部重叠

- sticky元素的父级不能含有overflow:hidden 和 overflow:auto 属性

- 必须具有top或bottom属性，如果同时定义了top和bottom，top赢

- ticky元素仅在他父级容器内有效，超出容器范围则不再生效了

- Chrome已经不再支持sticky属性，Safari 从 6.1开始支持，但表现也不太完美，Firefox 从版本 32开始支持了。IE一直不支持。

- js实现方法 [fixed-sticky](https://github.com/filamentgroup/fixed-sticky)

	- jquery版 [km-sticky](http://gitlab.alibaba-inc.com/tbc/km-sticky/blob/master/src/index.js)

	- [kg/sticky](http://gitlab.alibaba-inc.com/kg/sticky)

	- [宇果版](http://gitlab.alibaba-inc.com/mui/tabs/blob/master/src/sticky.js)



判断浏览器是否支持sticky

```
isPositionStickySupported: function() {
    if (isIE) return false;

    var container = doc[0].body;

    if (doc[0].createElement && container && container.appendChild && container.removeChild) {
        var isSupported = false,
            el = doc[0].createElement('div'),
            getStyle = function (st) {
                if (window.getComputedStyle) {
                    return window.getComputedStyle(el).getPropertyValue(st);
                } else {
                    return el.currentStyle.getAttribute(st);
                }
            };

        container.appendChild(el);

        for (var i = 0; i < stickyPrefix.length; i++) {
            el.style.cssText = 'position:' + stickyPrefix[i] + 'sticky;visibility:hidden;';
            if (isSupported = getStyle('position').indexOf('sticky') !== -1) break;
        }

        el.parentNode.removeChild(el);
        return isSupported;
    }
}
```

简化版

```
_supportCSS: function(property, value){
    var el = document.createElement('i');
    el.style[property] = value;
    var r = el.style[property];
    el = null;
    return r === value;
},
_getSticky: function(){
    var self = this;
    var supportVals = ['-webkit-sticky', '-ms-sticky', 'sticky'].filter(function(item){
        return self._supportCSS('position', item);
    });
    return supportVals.length ? supportVals[0] : null;
}
```
