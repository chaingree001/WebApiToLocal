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
![图片alt](/assets/npm-run-start.png  "启动本地服务")

###### 服务启动后
用浏览器打开 http:127.0.0.1:8001 即可访问本地UnityAPI文档。
* 首次访问会稍微慢，因为服务会去自动下载文件到本地。
* 凡是访问到的页面都将缓存到本地，下次打开则是访问本地缓存页面。
* 本地缓存页面存储在 cache 目录下，删除cache下的文件，下次访问则会重新加载网上内容。


![图片alt](/assets/unity-api-cn.png  "访问本地Unity中文API")

### 目录说明

```sh
cache/               # 为UnityAPI文档本地缓存目录
404.html             # 离线访问中未缓存页面的404内容
autoclick.html       # 工具：用来自动下载的注入代码
server.js    # 服务：本地API文档服务
```

#### 废话

任何静态网站，都可以下在到本地，并创立一个本地服务，只需稍微调整一下参数。