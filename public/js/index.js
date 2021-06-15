// 部署修改地址
let baseUrl = 'https://api.n0ts.cn/'
// baseUrl = 'http://127.0.0.1:3000/'
let api = baseUrl + 'api/'

function ajax(options, Callback) {
    var xhr = null;
    //创建对象
    if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest()
    } else {
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (options.type === "FILES") {
        xhr.open("POST", options.url, options.async); //链接改成你项目中的
        xhr.send(options.data); //发送时  Content-Type默认就是: multipart/form-data; 
    } else if (options.type === "POST") {
        xhr.open("POST", options.url, options.async); //链接改成你项目中的
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.send(options.data);
    } else {
        xhr.open("GET", options.url, options.async); //链接改成你项目中的
        xhr.send();
    }
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            let val
            if (xhr.responseText) {
                val = JSON.parse(xhr.responseText)
            }
            Callback(false, val)
        }
        if (this.status !== 200) {
            Callback(true)
        }
    }
}

// 获取元素
let ul = document.querySelector('.mainBox>ul')
let upload = document.getElementsByName('fs')[0]
let delBut = document.querySelector('.delete')
let checklBut = document.querySelector('.check')
let submitBut = document.querySelector('.upload>input')
let valueInput = document.querySelector('.right>input')

// 获取文件数据
function getFiles() {
    ajax({
        url: api + "getFilesDir", // url---->地址
        type: "GET", // type ---> 请求方式
        async: true, // async----> 同步：false，异步：true 
    }, (err, data) => {
        if (err) {
            alert('网页异常! 请联系管理员。')
            return console.log('500');
        }
        ul.innerHTML = ""
        if (data.length === 0) {
            let li = document.createElement('li')
            li.innerHTML = "暂无文件！"
            ul.appendChild(li);
        }
        let fragment = document.createDocumentFragment();
        let filesList = JSON.parse(sessionStorage.getItem("files"));
        data.forEach(item => {
            let li = document.createElement('li')
            let input = document.createElement('input')
            let a = document.createElement('a')
            let img = document.createElement('img')
            li.id = item
            img.src = './images/file.png'
            input.type = 'checkbox'
            input.name = item
            a.innerText = item
            a.href = baseUrl + item
            if (filesList) {
                if (filesList.includes(item)) {
                    a.style.color = "red"
                }
            }
            a.insertBefore(img, a.childNodes[0])
            li.appendChild(input)
            li.appendChild(a)
            fragment.appendChild(li);
        });
        ul.appendChild(fragment);
    })
}

getFiles();

// 点击上传
submitBut.onclick = function (event) {
    //取消掉默认的form提交方式
    if (event.preventDefault) {
        event.preventDefault();
    }
    else {
        event.returnValue = false;
    }
    let fs = Array.from(upload.files)
    if (!fs || fs.length == 0) {
        return alert('请选择文件!');
    }
    let filterFs = fs.filter((item, index) => {
        return item.type === "text/plain"
    })
    if (filterFs.length !== fs.length) {
        if (!confirm("部分文件不是 .txt 文件! 是否删除继续上传？")) return
    }
    let form = new FormData();
    filterFs.forEach(item => {
        form.append('fs', item)
    })
    // 发送请求删除
    ajax({
        url: api + "pushFiles", // url---->地址
        type: "FILES", // type ---> 请求方式
        async: true, // async----> 同步：false，异步：true 
        data: form
    }, (err, val) => {
        if (err) {
            return alert("上传失败败~~")
        }
        let mes = "上传成功！文件名：" + val.join(' , ')
        sessionStorage.setItem("files", JSON.stringify(val))
        alert(mes)
        getFiles()

    })

}

// 反选
function inputAll() {
    let inputAll = document.querySelectorAll('.mainBox>ul>li>input')
    inputAll.forEach(item => {
        item.checked = !item.checked
    })
}

// 删除
function butDelete() {
    let filesName = []
    let inputAll = document.querySelectorAll('.mainBox>ul>li>input')
    inputAll.forEach(item => {
        if (item.checked) {
            filesName.push(item.name)
        }
    })
    if (filesName.length === 0) {
        return
    }
    let psw = prompt("请输入密码！")
    let reg = /^psw/
    if (!reg.test(psw)) {
        return alert("密码错误！")
    }
    filesName = filesName.join(',')
    // 发送请求删除
    ajax({
        url: api + "deleteFiles", // url---->地址
        type: "POST", // type ---> 请求方式
        async: true, // async----> 同步：false，异步：true 
        data: `psw=${psw}&filesName=${filesName}`
    }, (err, val) => {
        if (err) {
            return alert("删除失败败~~~!")
        }
        alert(val)
        getFiles()
    })
}

// 搜索
function select() {
    let liAll = document.querySelectorAll('.mainBox>ul>li')
    if (valueInput.value.trim() === "") {
        return liAll.forEach(item => {
            item.style.display = 'block'
        });
    }
    liAll.forEach(item => {
        if (item.id.includes(valueInput.value.trim())) {
            item.style.display = 'block'
        } else {
            item.style.display = 'none'
        }
    });
}

// 尝试dom2
valueInput.addEventListener('input', select)
