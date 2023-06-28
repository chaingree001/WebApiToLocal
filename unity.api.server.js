
const http = require('http');
const fs = require('fs');
const path = require('path');
var mineType = require('mine-type');





// 服务器ip地址
// 在host文件中添加 proxy.docs.unity.cn 127.0.0.1 
// 则可以通过proxy.docs.unity.cn访问了
const hostname = '127.0.0.1'
// 服务端口
const port = 8001;
// 设置文档缓存时长，超过时长则拉取网上内容重新缓存
const cacheTimes = 60 * 60 * 24 * 30;
// 缓存标记文件
const cacheFilePath = path.resolve(__dirname, './cache.json');
// 读取历史缓存标记
const cacheStr = fs.readFileSync(cacheFilePath, 'utf8');
// 文件缓存标记
const cacheObj = cacheStr && JSON.parse(cacheStr) || {};
// 代理地址
const proxHost = 'https://docs.unity.cn';
// 代理首页
const home = '/cn/2021.3/ScriptReference/index.html'

// console.log('cacheObj ', JSON.stringify(cacheObj))

let td = 0;
const resetCacheFile = ()=>{
    if(td){
        clearTimeout(td);
        td=0
    }
    td = setTimeout(() => {
        fs.writeFileSync(cacheFilePath, JSON.stringify(cacheObj));
    }, 1000);
}



// 使用多进程
// 创建缓存服务
const server = http.createServer((req, res) => {
    const baseUrl = req.url.indexOf('?') == -1 ? req.url : req.url.split('?')[0];
    const url = baseUrl == '/' && home || baseUrl;
    const fileType = url.match(/.*\.([\w\d]+)$/);
    const type = fileType && fileType[1] || 'html';
    const lastReg = new RegExp(`${type}$`)
    const key = url.replace(/[^\w\d-_]/g, '').replace(lastReg, '');
    const contentType = mineType.getContentType(type);
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'max-age=3000');
    const localPath = path.resolve(__dirname, `./cache/${key}.${type}`);
    const currentTime = (new Date).getTime();
    const exptime = currentTime + cacheTimes;
    let reload = true;
    if (cacheObj[key]) {
        reload = false;
        const time = cacheObj[key];
        if (currentTime - time < cacheTimes) {
            try {
                const cacheFile = fs.readFileSync(localPath)
                res.end(cacheFile);
                return;
            } catch (err) {
                // 本地缓存文件丢失，需要重新请求远程文件
                reload = true;
            }
        }
    }

    if (reload) {
        const proxyUrl = proxHost + url;
        (void (0), async function () {
            try {
                const response = await fetch(proxyUrl, {
                    headers: {
                        Connection: 'keep-alive'
                    }
                });

                if (/html|json|xml|css|js|svg/.test(type)) {
                    response.text().then(html => {
                        try {
                            fs.writeFileSync(localPath, html);
                            res.end(html);
                            cacheObj[key] = exptime;
                            resetCacheFile();
                        } catch (err) {
                            res.end('<h1>404 Not Found</h1>\n');
                        }

                    });
                } else {
                    response.arrayBuffer().then(buffer => {
                        try {
                            const data = new Uint8Array(Buffer.from(buffer))
                            fs.writeFileSync(localPath, data);
                            const cacheFile = fs.readFileSync(localPath)
                            res.end(cacheFile);
                            cacheObj[key] = exptime;
                            resetCacheFile();
                        } catch (err) {
                            res.end('<h1>404 Not Found</h1>\n');
                        }

                    });
                }

            } catch (err) {
                res.end('<h1>404 Not Found</h1>\n');
            }
        }())
    }

});


server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}`)
});