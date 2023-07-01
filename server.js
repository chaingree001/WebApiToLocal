const path = require("node:path");
const http = require("node:http");
const fs = require("node:fs");
const mineType = require("mine-type");
 
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

 
  // 服务器ip地址
  // 在host文件中添加 proxy.docs.unity.cn 127.0.0.1
  // 则可以通过proxy.docs.unity.cn访问了
  const hostname = "127.0.0.1";
  // 服务端口
  const port = 8001;
  // 代理地址
  const proxHost = "https://docs.unity.cn";
  // 代理首页
  const home = "/cn/2021.3/Manual/index.html";
  // 缓存加速
  const cache = {};
  const hasCache = {};
  // 404页面
  const notFind = fs.readFileSync(path.resolve(__dirname, `./404.html`));
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
    if (hasCache[key]) {
      res.end(cache[key]);
      return;
    }
    let hasFile = false;
    try {
      fs.accessSync(localPath, fs.constants.R_OK);
      hasFile = true;
    } catch (err) {
      hasFile = false;
    }

    if (hasFile) {
      try {
        cache[key] = fs.readFileSync(localPath);
        hasCache[key] = true;
        res.end(cache[key]);
      } catch (err) {
        hasCache[key] = false;
        cache[key] = null;
        res.end();
      }
    } else {
      const realUrl = proxHost + url + (urlQuary[1] ? "?" + urlQuary[1] : "");
      request(type, realUrl, {}, localPath)
        .then((value) => {
          hasCache[key] = true;
          cache[key] = value;
          res.end(value);
        })
        .catch((reson) => {
          hasCache[key] = false;
          cache[key] = null;
          res.end(notFind);
        });
    }
  });

  server.listen(port, hostname, () => {
    console.log(
      `Server running at http://${hostname}:${port}  ${process.pid} `
    );
  });
 