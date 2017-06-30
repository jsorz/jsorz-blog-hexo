var fs = require('fs');
var path = require('path');

// [glob doc](https://github.com/isaacs/node-glob)
var glob = require('glob');

// hm-fe 根目录
var HM_FE_DIR = '/Users/luyining/workspace/tongji/hm-fe/';

function arrayContains(arr, value) {
    return Array.prototype.includes
        ? arr.includes(value)
        : arr.some(function (item) {
        return item === value;
    });
}

function copyFiles(files) {
    files.forEach(function (file) {
        var source = path.resolve(HM_FE_DIR + 'sass/', file);
        var target = path.resolve('./sass/', file);

        if (fs.existsSync(source)) {
            fs.createReadStream(source).pipe(fs.createWriteStream(target));
        }
    });
}

// 提取 scss 文件中的图片地址
glob('./_posts/**/*.md', function (err, files) {
    files.forEach(function (file) {
        var content = fs.readFileSync(file).toString();
        content = content.replace('<!-- break -->', '<!-- more -->');

        // <img src="/assets/captures/20160922_light_dispersion.jpg" style="max-width:400px">
        content = content.replace(/<img\s+src="\/assets\/(\S+)\/(\S+)"\sstyle=".*">/g, '<img src="/images/$1/$2">');

        // [穿插在第一篇中](/blog/2015/01/18/step-by-step-js-component-schoolbox-1#section-1)
        // var blogs = content.match(/\[(.+)\]\(\/blog\/(\d+)\/(\d+)\/(\d+)\/([^#]+)(#\S*)?\)/g);
        var blogReg = /\[(.+)\]\(\/blog\/(\d+)\/(\d+)\/(\d+)\/[\w|-]+?(#[\w|-]+)?\)/g;

        // var blogs = blogReg.exec(content);
        // debugger
        // blogs.forEach(function (link) {
        //     console.log(link);
        // });
        // content = content.replace(/\[(.+)\]\(\/blog\/(\d+)\/(\d+)\/(\d+)\/([^#]+)(#\S*)?\)/g, '[$1](/blog/$2/$3/$5.html$6)');

        fs.writeFileSync(file, content);
    });
});
