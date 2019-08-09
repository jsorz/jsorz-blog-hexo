---
title: React文档备忘
category: javascript
tags: [读书笔记]
---

React 文档陆陆续续看了两三遍，但一直没有真正做过业务，每次都只记住个大概。这回跳出舒适区，主动在业务里用 React，记录一些文档中的关键点。

<!-- more -->

## 基础

### React Class

- React.Component

- - 默认的 `shouldComponentUpdate` 全是 deep compare，性能开销大
  - 可自行重写 `shouldComponentUpdate()`，作为一种优化手段

- React.PureComponent

- - 不建议重写 `shouldComponentUpdate()`
  - 默认的 `shouldComponentUpdate` 中通过浅层比较 props 与 state

- - - 适用于简单数据模型，无嵌套结构
    - 子组件树的 props 更新可能不会触发重新渲染
    - 最好没有子组件，有的话最好也是纯组件

- - <https://lucybain.com/blog/2018/react-js-pure-component/>

- React.Fragment

- - 在不额外创建 DOM 元素的情况下，在 `render()` 中返回多个元素
  - 简写为 `<></>`



### 生命周期

- constructor(props)
- render()
- *UNSAFE_componentWillMount*
- componentDidMount()
- *UNSAFE_componentWillReceiveProps*
- shouldComponentUpdate()
- *UNSAFE_componentWillUpdate*
- componentDidUpdate()
- componentWillUnmount()

注：`UNSAFE` 开头的函数为已过时的生命周期钩子，[详见官网博客](https://zh-hans.reactjs.org/blog/2018/03/27/update-on-async-rendering.html)。



### 高级玩法

用于状态维护

- Hook：用于状态逻辑的复用

- - 可写出更简洁的代码，减少相同逻辑分散多处

- Context：用于跨层元素传递 props

- - 会降低组件的复用性，使用前想想清楚
  - 考虑直接传递组件，或者传递 render props



用于提高复用 (关注点分离)

- Render Prop
- HOC 高阶组件

- - [Mixins Considered Harmful](https://zh-hans.reactjs.org/blog/2016/07/13/mixins-considered-harmful.html)
  - HOC 是纯函数，没有副作用
  - 高阶组件要透传所有 props
  - [如何从 Class 迁移到 Hook](https://zh-hans.reactjs.org/docs/hooks-faq.html#from-classes-to-hooks)



控制DOM

- Refs 转发：比 Vue 的能力强

- - 个人感觉不利于组件内聚性
  - 适用于HOC高阶组件中



设计模式

- 优先组合，而非继承
- [2019 ReactJS Best Practices](https://medium.com/@konstankino/2019-reactjs-best-practices-design-patterns-516e1c3ca06a)
- [2019 Using Redux and Redux-Thunk ](https://medium.com/@konstankino/2019-redux-and-redux-thunk-for-reactjs-explained-e249b70d6188)



## 坑点

### this binding

背景：在 ES6 class 写法中，绑定的自定义事件函数执行时会遇到 this 作用域问题

原因：React 对待生命周期的钩子函数时，会主动绑定 this，而对待 JSX 中的回调函数则不会？?

解决办法

- extra bind in constructor

- - 代码累赘

- bind in render function

- - 每次重新渲染都绑了一个新函数

- use class property and arrow function

- - babel: class-properties or preset-react



### render HOC

不要在 render 方法中使用 HOC

```jsx
render() {
  // 每次调用 render 函数都会创建一个新的 EnhancedComponent
  // EnhancedComponent1 !== EnhancedComponent2
  const EnhancedComponent = enhance(MyComponent);
  // 这将导致子树每次渲染都会进行卸载，和重新挂载的操作！
  return <EnhancedComponent />;
}
```

React 的 diff 算法（reconciliation）使用组件标识来确定它是应该更新现有子树还是将其丢弃并挂载新子树。 如果从 `render` 返回的组件与前一个渲染中的组件相同（`===`），则 React 通过将子树与新子树进行区分来递归更新子树。 如果它们不相等，则完全卸载前一个子树。

