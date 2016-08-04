/**
 * author: jinweigang
 * date: 2016-08-03
 * description 基于localStorage的静态文件缓存库
 */

(function(factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else {
    factory();
  }
}(function(undefined) {

  /**
   * @function getKey
   * @description 解析特征url中key值
   * @param {url: 静态文件url}
   */
  var getKey = function(url) {
    //解析相关版本key
    var index = url.lastIndexOf('/');
    return url.substring(++index).split('.')[0];
  };

  /**
   * @function setStorage
   * @description 设置本地缓存
   * @param {url:静态文件url，value:文件内容}
   */
  var setStorage = function(url, value) {
    //防止阻塞，模拟异步IO
    var timer = setTimeout(function(){
      //移除旧版本文件
      removeOldFile(getKey(url));
      //缓存新文件
      localStorage.setItem(getKey(url), value);
      clearTimeout(timer);
    },0);
  };

  /**
   * @function getStorage
   * @description 获取本地缓存
   * @param {url:静态文件url}
   */
  var getStorage = function(url) {
    return localStorage.getItem(getKey(url));
  };

  /**
   * @function removeOldFile
   * @description 移除本地旧版缓存文件
   * @param {url:静态文件url}
   */
  var removeOldFile = function(url) {
    for (var i = 0; i < localStorage.length; i++) {
      localStorage.map(function(key){
        if ((key.split('-').length>1)
            && key.split('-')[0] == getKey(url).split('-')[0]
        ){
          console.log('%c 版本更新：' + url,'color:red');
          localStorage.removeItem(key);
        }
      });
    }
  };

  /**
   * @function fetchStatic
   * @description 获取js/css文件
   * @param {url:静态文件内容，callback:文件加载完全后的回调操作}
   */
  var fetchStatic = function(url, callback) {
    var xhr = new XMLHttpRequest();
    var source = '';
    xhr.open("get", url, true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        if ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 304) {
          if (xhr.response == '') return;
          callback(xhr.response);
        }
      }
    };
    xhr.send(null);
    return source;
  };

  /**
   * @function routeLoad
   * @description 根据类型分发加载
   * @param {url: js文件路径, type:0服务器读取，1缓存读取}
   */
  var routeLoad = function(url, type) {
    if (url.indexOf('.js') > -1) {
      loadJS(url, type);
    } else {
      loadCSS(url, type);
    }
  };

  /**
   * @function loadJS
   * @description 获取js文件
   * @param {url: js文件路径, type:0服务器读取，1缓存读取}
   */
  var loadJS = function(url, type) {
    if(type == 0) {
      fetchStatic(url, function(source){
        runJS(source);
        setStorage(url, source);
      });
    } else {
      source = getStorage(url);
      runJS(source);
    }
  };

  /**
   * @function runJS
   * @description 添加样式文件
   * @param {source:样式内容}
   */
  var runJS = function(source){
    var script = document.createElement('script');
    script.appendChild(document.createTextNode(source));
    document.getElementsByTagName('body')[0].appendChild(script);
  };

  /**
   * @function loadCss
   * @description 获取css文件
   * @param {url: css文件路径, type:0服务器读取，1缓存读取}
   */
  var loadCSS = function(url, type) {
    if(type == 0) {
      fetchStatic(url, function(source){
        runCSS(source);
        setStorage(url, source);
      });
    } else {
      source = getStorage(url);
      runCSS(source);
    }
  };

  /**
   * @function runCSS
   * @description 添加样式文件
   * @param {source:样式内容}
   */
  var runCSS = function(source){
    var style = document.createElement('style');
    style.appendChild(document.createTextNode(source));
    document.getElementsByTagName('head')[0].appendChild(style);
  };

  /**
   * @function loadST
   * @description 加载静态文件
   */
  var loadST = function() {
    //可将静态文件url放在dom的attribute属性，获取staticArr
    var staticArr = [];
    staticArr.map(function(url){
      if (!window.localStorage || !localStorage[getKey(url)]) {
        routeLoad(url, 0);
        console.log('%c 远程读取：' + url, 'color:red');
      } else {
        routeLoad(url, 1);
        console.log('%c 本地读取：' + url, 'color:red');
      }
    });
  };

  //脚本初始化
  loadST();

  return { loadST: loadST };
}));
