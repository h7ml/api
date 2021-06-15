const express = require('express');
const app = express();
const path = require('path')
const fs = require('fs')
const multiparty = require("multiparty")
const cors = require('cors'); // 安装模块 
app.use(cors()) // 跨域

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({   //配置
    extended: true
}));
app.use(bodyParser.json())   //配置

// 开放资源
app.use(express.static(path.join(__dirname, 'files/')))
app.use(express.static(path.join(__dirname, 'public/')))

// 文件目录读取
function readDir(url, Callback) {
    fs.readdir(url, (err, data) => {
        if (err) {
            return Callback(err)
        }
        Callback(err, data)
    })
}
// 重命名
function rename(arr, name, num = 1) {
    if (!arr.includes(name)) {
        return name
    }
    name = num + name;
    return rename(arr, name, ++num)
}

// 文件目录读取
app.get("/api/getFilesDir", (req, res) => {
    readDir(path.join(__dirname, 'files/'), (err, data) => {
        if (err) {
            console.log(err);
            return res.send('500')
        }
        res.send(data)
    })
})

// 上传文件
app.post("/api/pushFiles", (req, res) => {
    fs.readdir(path.join(__dirname, 'files/'), (err, data) => {
        if (err) {
            console.log(err);
            return res.send('500')
        }
        let form = new multiparty.Form({
            encoding: 'utf-8',
            uploadDir: path.join(__dirname, 'files/') // 指定文件存储目录
        });

        form.on('file', (name, file) => { // 接收到文件参数时，触发file事件
            if (err) {
                console.log(err);
                return res.send('500')
            }
            // 文件重命名
            let fname = rename(data, file.originalFilename)
            file.originalFilename = fname;
        })

        form.parse(req, (err, fields, files) => {
            if (err) {
                console.log(err.message);
                return res.send('500')
            }
            fs.readdir(path.join(__dirname, 'files/'), (err, data) => {
                if (err) {
                    console.log(err);
                    return res.send('500')
                }
            })
            let arr = [];
            files.fs.forEach(item => {
                fs.renameSync(item.path, form.uploadDir + item.originalFilename);  // 使用fs对文件重命名
                arr.push(item.originalFilename)
            });
            let obj = {
                files:arr
            }
            res.send(JSON.stringify(arr))
        })
    })
})

// 删除文件
app.post("/api/deleteFiles", (req, res) => {
    let psw = req.body.psw;
    let files = req.body.filesName.split(',')
    if (!files || files.length === 0) {
        return res.send(JSON.stringify("请选择文件！"))
    }
    if (psw !== "pswyxmsb") {
        return res.send(JSON.stringify("密码错误！"))
    }
    let err = false;
    files.forEach(item => {
        fs.unlink(path.join(__dirname, `files/${item}`), (error) => {
            if (error) {
                err = true;
            }
        })
    })
    if (err) {
        return res.send(JSON.stringify("删除失败！"))
    }
    res.send(JSON.stringify("删除成功！"))
})

const port = process.env.PORT || 3000
const host = process.env.HOST || ''

app.server = app.listen(port, host, () => {
  console.log(`server running @ http://${host ? host : 'localhost'}:${port}`)
})

module.exports = app
