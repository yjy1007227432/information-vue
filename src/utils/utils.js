export const isNotNullORBlank = (...args)=> {
  for (var i = 0; i < args.length; i++) {
    var argument = args[i];
    if (argument == null || argument == '' || argument == undefined) {
      return false;
    }
  }
  return true;
}
var px2remLoader = {
  loader: 'px2rem-loader',
  options: {
    remUnit: 64//设计稿宽度/10
  }
};

// generate loader string to be used with extract text plugin
function generateLoaders(loader, loaderOptions) {
  var loaders = [cssLoader, px2remLoader];//添加px2rem 插件
  if (loader) {
    loaders.push({
      loader: loader + '-loader',
      options: Object.assign({}, loaderOptions, {
        sourceMap: options.sourceMap
      })
    })
  }
}
