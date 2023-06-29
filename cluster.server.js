const cluster = require("node:cluster");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const mineType = require("mine-type");
const numCPUs = require("node:os").availableParallelism(); // 获取CPU的个数
// 服务器ip地址
// 在host文件中添加 proxy.docs.unity.cn 127.0.0.1
// 则可以通过proxy.docs.unity.cn访问了
const hostname = "127.0.0.1";
// 服务端口
const port = 8001;
// 设置文档缓存时长，超过时长则拉取网上内容重新缓存
const cacheTimes = 60 * 60 * 24 * 30 * 1000;
// 代理地址
const proxHost = "https://docs.unity.cn";
// 代理首页
const home = "/cn/2021.3/ScriptReference/index.html";

cluster.schedulingPolicy = cluster.SCHED_RR;

const request = async function (type, url, header, localPath) {
  return new Promise((resolve, reject) => {
    fetch(url, header)
      .then((response) => {
        try {
          if (/html|json|xml|css|js|svg/.test(type)) {
            response
              .text()
              .then((text) => {
                fs.writeFileSync(localPath, text);
                resolve(text);
              })
              .catch((reson) => {
                reject(false);
              });
          } else {
            response.arrayBuffer().then((buffer) => {
              const data = new Uint8Array(Buffer.from(buffer));
              fs.writeFileSync(localPath, data);
              resolve(fs.readFileSync(localPath));
            });
          }
        } catch (reson) {
          reject(false);
        }
      })
      .catch((reson) => {
        reject(false);
      });
  });
};
// 使用多进程
if (cluster.isMaster) {
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }
} else {
  // 创建缓存服务
  const server = http.createServer((req, res) => {
    const urlQuary = req.url.split("?");
    const baseUrl = urlQuary.length == 1 ? req.url : urlQuary[0];
    if (baseUrl == "/") {
      res.writeHead(301, { Location: "http://" + req.headers["host"] + home });
      return res.end();
    }
    const url = baseUrl;
    const fileType = url.match(/.*\.([\w\d]+)$/);
    const type = (fileType && fileType[1]) || "html";
    const lastReg = new RegExp(`${type}$`);
    const key = url.replace(/[^\w\d-_]/g, "").replace(lastReg, "");
    const contentType = mineType.getContentType(type);
    const localPath = path.resolve(__dirname, `./cache/${key}.${type}`);
    res.setHeader("Content-Type", contentType);
    let hasFile = false;
    try {
      fs.accessSync(localPath, fs.constants.R_OK);
      hasFile = true;
    } catch (err) {}

    if (hasFile) {
      try {
        const cacheFile = fs.readFileSync(localPath);
        res.end(cacheFile);
      } catch (err) {
        res.end();
      }
    } else {
      const realUrl = proxHost + url + (urlQuary[1] ? "?" + urlQuary[1] : "");
      request(type, realUrl, {}, localPath)
        .then((value) => {
          res.end(value);
        })
        .catch((reson) => {
          res.end();
        });
    }
  });

  server.listen(port, hostname, () => {
    console.log(
      `Server running at http://${hostname}:${port}  ${process.pid} `
    );
  });
}
