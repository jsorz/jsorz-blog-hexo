---
title: 再看flatten
category: javascript
tags: [algorithm]
---

前一篇中提到了可利用`reduce`函数做[数组扁平化](/blog/2017/08/make-use-of-reduce.html#数组扁平化)，这里记录下不依赖`reduce`不依赖递归的方法。

<!-- more -->

underscore 实现

```
// Internal implementation of a recursive `flatten` function.
var flatten = function(input, shallow, strict, output) {
    output = output || [];
    var idx = output.length;
    for (var i = 0, length = getLength(input); i < length; i++) {
        var value = input[i];
        if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
            // Flatten current level of array or arguments object.
            if (shallow) {
                var j = 0, len = value.length;
                while (j < len) output[idx++] = value[j++];
            } else {
                flatten(value, shallow, strict, output);
                idx = output.length;
            }
        } else if (!strict) {
            output[idx++] = value;
        }
    }
    return output;
}
```
