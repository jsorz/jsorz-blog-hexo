### Promise

promisify

```javascript
const promisify = (fn, receiver) => {
  return (...args) => {
    return new Promise((resolve, reject) => {
      fn.apply(receiver, [...args, (err, res) => {
        return err ? reject(err) : resolve(res);
      }]);
    });
  };
};
```

loadScript

```javascript
const loadScript = (url) => new Promise(resolve => {
  const script = document.createElement('script');
  script.src = url;
  // 转成了 promise
  script.addEventListener('load', resolve);
  // 必须先监听好，再加到 DOM 中（兼容性考虑）
  document.head.appendChild(script);
})
```

### callee 巧用

forEach recursive

```javascript
items.forEach(function callee(item) {
  // do something
  if (item.children) {
    item.children.forEach(callee);
  }
});
```

retry if rejected

```javascript
(function callee(action) {
  ActionPromise(action)
  	.then(() => {
      // do something
  	}, () => {
      // retry
      callee(action)
  	})
});
```

### fetch API

```javascript
fetch('./package.json').then(function(response) {
	return response.json();
  })
  .then(function(pkg) {
  	// now pkg is json
  });
  
fetch(new Request(url, config)).then(...)
```

### quick sort

```javascript
const quickSort = (arr) => {
  const swap = (arr, i, j) => {
    let tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
  };

  const sorting = (arr, left, right) => {
    if (!arr || !arr.length || arr.length === 1 || left >= right) {
      return;
    }
    let low = left;
    let high = right;
    let pivot = arr[low];

    while (low < high) {
      while (arr[high] > pivot && low < high) {
        high--;
      }
      if (low < high) {
        swap(arr, low, high);
        low++;
      }

      while (arr[low] <= pivot && low < high) {
        low++;
      }
      if (low < high) {
        swap(arr, low, high);
        high--;
      }
    }
    arr[low] = pivot;
    sorting(arr, left, low - 1);
    sorting(arr, low + 1, right);
  };

  if (arr && arr.length && arr.length > 1) {
    sorting(arr, 0, arr.length - 1);
  }
  return arr;
}
```

```javascript
const quickSort2 = arr => {
  if (!arr || !arr.length || arr.length <= 1) {
    return arr;
  }
  // 取中间元素作为哨兵，并且从原数组拎出
  const pivot = arr.splice(Math.floor(arr.length / 2), 1)[0];
  let left = [];
  let right = [];
  
  for (let v of arr) {
    if (v > pivot) {
      right.push(v);
    } else {
      left.push(v);
    }
  }
  return [...quickSort2(left), pivot, ...quickSort2(right)];
}
```

