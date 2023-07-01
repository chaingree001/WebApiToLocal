# Unity3D Local API
  Unity3D API 本地中文文档。 

### 先决条件
  需要安装Nodejs，版本号最好为18及以上。

### 初始化
下载项目后初始化项目
```sh
$ npm install
```

### 启动服务

windows系统，点击目录下文件run.bat启动本地web服务
Mac & Linux系统， 执行文件run.sh启动本地web服务。

或者在当前目录下运行命令：
```sh
$ npm run start
```

###### 服务启动后
用浏览器打开 http:127.0.0.1:8001 即可访问本地UnityAPI文档

### 目录说明

```sh
cache/               # 为UnityAPI文档本地缓存目录
404.html             # 离线访问中未缓存页面的404内容
auto.load.server.js  # 工具：将UnityAPI网站内容自动下载到本地服务
autoclick.html       # 工具：自动点击网页导航菜单代码
cluster.server.js    # 服务：本地API文档服务
```

#### 废话

任何静态网站，都可以下在到本地，并创立一个本地服务，只需稍微调整一下参数。