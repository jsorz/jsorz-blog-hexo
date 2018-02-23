## 绘图

### Canvas

- 依赖分辨率，需要设置画布尺寸
- 不支持事件处理器（只能在`<canvas>`节点上绑定事件）
- 弱的文本渲染能力（没有对绘制文本提供任何支持）
- 能够以 .png 或 .jpg 格式保存结果图像
- 最适合图像密集型的游戏，其中的许多对象会被频繁重绘

- 原生 canvas API 只提供基于 graphics context 来绘制图形（像素操作）

excanvas

- 兼容IE8，使用VML实现，将 canvas 的调用转成 XML 定义
- 性能欠佳

zrender

- basis of ECharts

### SVG

- 不依赖分辨率，矢量
- 支持事件处理器（可在`<svg>`中的任一子节点上绑定事件）
- 最适合带有大型渲染区域的应用程序（比如谷歌地图）
- 复杂度高会减慢渲染速度（任何过度使用 DOM 的应用都不快）
- 不适合游戏应用

D3.js

- 提供在其上的封装以及链式语法，属性、动画方面类似 jquery
- Data-Driven Documents

Raphael

- 兼容性更好
- general vector graphics

GraphicsJS

- Out-of-box feature

### Charts

