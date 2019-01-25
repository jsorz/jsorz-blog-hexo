---
title: “滑稽”的事件循环
category: javascript
tags: [javascript]
---

最近在写 Vue 时遇到了一个问题，大体场景是：有一个组件 A 用于对话框中，也可用在对话框之外。A 初始化后会请求数据，当它用于对话框中时，可能会接收外部传入的参数，需要根据这些参数去请求数据。

我们知道大部分 Dialog 组件在实现时，只有当对话框首次被打开时才会去渲染其内部的 content 部分。于是问题是：当组件 A 处于对话框中，并且首次打开对话框时，A 先被初始化，然后对话框向 A 透传外部传入的参数，由 A 发起数据请求。

<!-- more -->

## 事故现场

```javascript
export const A = {
  methods: {
    reload() {
      // 省略...请求数据
    },
    receiveContext({ params, data } = {}) {
      // 省略...
      this.reload();
    },
  },
  mounted() {
    // this.reload();
    nextTick(() => this.reload(), 0);
  }
};
```

A 的 `mounted` 先被触发，调用 `reload` 函数；接着外部开始调用 `receiveContext`，再次调用 `reload`，也就出现了在对话框首次打开时会重复请求。

P.S. 别问我为什么不用 `props` 透传，因为我用 dispatch action 触发 `receiveContext`。

无论我在哪儿怎么加 `nextTick`，都避免不了在第一次渲染时重复请求的问题。于是发现自己对 nextTick 的本质还没搞透。

### 修复后

先直接给出修复后的代码，再慢慢探究原因。

```javascript
export const A = {
  methods: {
    reload() {
      // NOTE: 防止初次渲染 receiveContext 后触发 2次 reload
      if (this._macroTimer) {
        clearTimeout(this._macroTimer);
        this._macroTimer = null;
      }
      // 省略...请求数据
    },
    receiveContext({ params, data } = {}) {
      // 省略...
      this.reload();
    },
  },
  mounted() {
    // NOTE: setTimeout 为 macrotask, 可以保证在 nextTick (microtask) 之后执行
    this._macroTimer = setTimeout(() => this.reload(), 0);
  }
};
```

## Event Loop

都知道 js 是单线程的，为什么要设计成单线程，读者不妨可以思考一下🤔

同时 js 又是非阻塞的，这就是 Event Loop 的功劳了。

1. 主线程运行的时候会生成堆（heap）和栈（stack）；
2. js 从上到下解析方法，将其中的同步任务按照执行顺序排列到执行栈中；
3. 当程序调用外部的API时，比如 ajax、setTimeout 等，会将此类异步任务挂起，继续执行执行栈中的任务，等异步任务返回结果后，再按照执行顺序排列到事件队列中；
4. 主线程先将执行栈中的同步任务清空，然后检查事件队列中是否有任务，如果有，就将第一个事件对应的回调推到执行栈中执行，若在执行过程中遇到异步任务，则继续将这个异步任务排列到事件队列中。
5. 主线程每次将执行栈清空后，就去事件队列中检查是否有任务，如果有，就每次取出一个推到执行栈中执行，这个过程是循环往复的，就叫做 Event Loop 事件循环。

### macro task + micro task

在 Event Loop 为了区分异步任务的执行优先级，js 设计出了 macro task (宏任务) 与 micro task (微任务) 这两个概念。

常见的 task 有

- macro task: setTimeout，setInterval，setImmediate，I/O (磁盘读写或网络通信)，UI 交互事件

- micro task: process.nextTick，Promise.then

事件循环会将遇到的异步任务排列到对应的 macro task 及 micro task 队列中：

- 当执行栈中的任务清空，主线程会先检查 micro task 队列中是否有任务，如果有，就将 micro task 队列中的任务依次执行，直到队列为空；
- 然后再检查 macro task 队列中是否有任务，如果有，则每次取出【第一个】macro task 加入到执行栈中；
- 再次清空执行栈，重新检查微任务（重复第一步）

### 测试代码

test 1

```javascript
console.log(1);

setTimeout(() => {
  console.log(6);
}, 0);

new Promise(resolve => {
  console.log(2);
  resolve();
}).then(() => {
  console.log(4);
}).then(() => {
  console.log(5);
});

console.log(3);
```

test 2

```javascript
console.log(1);

setTimeout(() => {
  console.log(5);
}, 0);

new Promise(resolve => {
  console.log(2);
  resolve();
}).then(() => {
  setTimeout(() => console.log(6), 0);
}).then(() => {
  console.log(4);
});

console.log(3);
```

test 3

```javascript
console.log(1);

setTimeout(() => {
  Promise.resolve().then(() => console.log(5));
}, 0);

new Promise(resolve => {
  console.log(2);
  resolve();
}).then(() => {
  setTimeout(() => console.log(6), 0);
}).then(() => {
  console.log(4);
});

console.log(3);
```

test 4

```javascript
console.log(1);

setTimeout(() => {
  Promise.resolve().then(() => console.log(6));
}, 0);

new Promise(resolve => {
  console.log(2);
  resolve();
}).then(() => {
  Promise.resolve().then(() => console.log(4), 0);
}).then(() => {
  console.log(5);
});

console.log(3);
```

以上所有示例都按 1 2 3 4 5 6 的顺序输出。

最后一例中，关于 `4` 和 `5` 的输出顺序，还是有点“滑稽”。

## Vue nextTick

### v2.4.4

```javascript
/**
 * Defer a task to execute it asynchronously.
 */
export const nextTick = (function () {
  const callbacks = []
  let pending = false
  let timerFunc

  function nextTickHandler () {
    pending = false
    const copies = callbacks.slice(0)
    callbacks.length = 0
    for (let i = 0; i < copies.length; i++) {
      copies[i]()
    }
  }

  // the nextTick behavior leverages the microtask queue, which can be accessed
  // via either native Promise.then or MutationObserver.
  // MutationObserver has wider support, however it is seriously bugged in
  // UIWebView in iOS >= 9.3.3 when triggered in touch event handlers. It
  // completely stops working after triggering a few times... so, if native
  // Promise is available, we will use it:
  /* istanbul ignore if */
  if (typeof Promise !== 'undefined' && isNative(Promise)) {
    var p = Promise.resolve()
    var logError = err => { console.error(err) }
    timerFunc = () => {
      p.then(nextTickHandler).catch(logError)
      // in problematic UIWebViews, Promise.then doesn't completely break, but
      // it can get stuck in a weird state where callbacks are pushed into the
      // microtask queue but the queue isn't being flushed, until the browser
      // needs to do some other work, e.g. handle a timer. Therefore we can
      // "force" the microtask queue to be flushed by adding an empty timer.
      if (isIOS) setTimeout(noop)
    }
  } else if (!isIE && typeof MutationObserver !== 'undefined' && (
    isNative(MutationObserver) ||
    // PhantomJS and iOS 7.x
    MutationObserver.toString() === '[object MutationObserverConstructor]'
  )) {
    // use MutationObserver where native Promise is not available,
    // e.g. PhantomJS, iOS7, Android 4.4
    var counter = 1
    var observer = new MutationObserver(nextTickHandler)
    var textNode = document.createTextNode(String(counter))
    observer.observe(textNode, {
      characterData: true
    })
    timerFunc = () => {
      counter = (counter + 1) % 2
      textNode.data = String(counter)
    }
  } else {
    // fallback to setTimeout
    /* istanbul ignore next */
    timerFunc = () => {
      setTimeout(nextTickHandler, 0)
    }
  }

  return function queueNextTick (cb?: Function, ctx?: Object) {
    let _resolve
    callbacks.push(() => {
      if (cb) {
        try {
          cb.call(ctx)
        } catch (e) {
          handleError(e, ctx, 'nextTick')
        }
      } else if (_resolve) {
        _resolve(ctx)
      }
    })
    if (!pending) {
      pending = true
      timerFunc()
    }
    if (!cb && typeof Promise !== 'undefined') {
      return new Promise((resolve, reject) => {
        _resolve = resolve
      })
    }
  }
})()
```

可以看到，Vue 优先使用 `Promise.resolve()` 来实现 nextTick，对于不支持 Promise 的设备则使用 `MutationObserver`，再次之则降级为 `setTimeout`。

### v2.5.17

```javascript
const callbacks = []
let pending = false

function flushCallbacks () {
  pending = false
  const copies = callbacks.slice(0)
  callbacks.length = 0
  for (let i = 0; i < copies.length; i++) {
    copies[i]()
  }
}

// Here we have async deferring wrappers using both microtasks and (macro) tasks.
// In < 2.4 we used microtasks everywhere, but there are some scenarios where
// microtasks have too high a priority and fire in between supposedly
// sequential events (e.g. #4521, #6690) or even between bubbling of the same
// event (#6566). However, using (macro) tasks everywhere also has subtle problems
// when state is changed right before repaint (e.g. #6813, out-in transitions).
// Here we use microtask by default, but expose a way to force (macro) task when
// needed (e.g. in event handlers attached by v-on).
let microTimerFunc
let macroTimerFunc
let useMacroTask = false

// Determine (macro) task defer implementation.
// Technically setImmediate should be the ideal choice, but it's only available
// in IE. The only polyfill that consistently queues the callback after all DOM
// events triggered in the same loop is by using MessageChannel.
/* istanbul ignore if */
if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
  macroTimerFunc = () => {
    setImmediate(flushCallbacks)
  }
} else if (typeof MessageChannel !== 'undefined' && (
  isNative(MessageChannel) ||
  // PhantomJS
  MessageChannel.toString() === '[object MessageChannelConstructor]'
)) {
  const channel = new MessageChannel()
  const port = channel.port2
  channel.port1.onmessage = flushCallbacks
  macroTimerFunc = () => {
    port.postMessage(1)
  }
} else {
  /* istanbul ignore next */
  macroTimerFunc = () => {
    setTimeout(flushCallbacks, 0)
  }
}

// Determine microtask defer implementation.
/* istanbul ignore next, $flow-disable-line */
if (typeof Promise !== 'undefined' && isNative(Promise)) {
  const p = Promise.resolve()
  microTimerFunc = () => {
    p.then(flushCallbacks)
    // in problematic UIWebViews, Promise.then doesn't completely break, but
    // it can get stuck in a weird state where callbacks are pushed into the
    // microtask queue but the queue isn't being flushed, until the browser
    // needs to do some other work, e.g. handle a timer. Therefore we can
    // "force" the microtask queue to be flushed by adding an empty timer.
    if (isIOS) setTimeout(noop)
  }
} else {
  // fallback to macro
  microTimerFunc = macroTimerFunc
}

/**
 * Wrap a function so that if any code inside triggers state change,
 * the changes are queued using a (macro) task instead of a microtask.
 */
export function withMacroTask (fn: Function): Function {
  return fn._withTask || (fn._withTask = function () {
    useMacroTask = true
    const res = fn.apply(null, arguments)
    useMacroTask = false
    return res
  })
}

export function nextTick (cb?: Function, ctx?: Object) {
  let _resolve
  callbacks.push(() => {
    if (cb) {
      try {
        cb.call(ctx)
      } catch (e) {
        handleError(e, ctx, 'nextTick')
      }
    } else if (_resolve) {
      _resolve(ctx)
    }
  })
  if (!pending) {
    pending = true
    if (useMacroTask) {
      macroTimerFunc()
    } else {
      microTimerFunc()
    }
  }
  // $flow-disable-line
  if (!cb && typeof Promise !== 'undefined') {
    return new Promise(resolve => {
      _resolve = resolve
    })
  }
}
```



【参考资料】

[http://hcysun.me/vue-design/art/8vue-reactive-dep-watch.html#nexttick-的实现](http://hcysun.me/vue-design/art/8vue-reactive-dep-watch.html#nexttick-的实现)

https://developer.mozilla.org/zh-CN/docs/Web/API/MutationObserver

