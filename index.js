/*
 * @Author: shoestrong
 * @Date: 2019-09-19 15:13:28
 * @Description: file content
 * @LastEditTime: 2019-09-19 18:40:38
 * @LastEditors: shoestrong
 */
const fs = require('fs');
const path = require('path')
const inquirer = require('inquirer')
const chalk = require('chalk')
const ora = require('ora');

const {join} = path

// 要输出的语言
const langs = ['zh_CN', 'zh_TW', 'en']

// 输出路径
const OUTPATH = './lang'

// 本地JSON文件
const ENTRYPATH = './local'


// 交互式提示
inquirer.prompt([
  {
    type: 'checkbox',
    choices: langs,
    name: 'checked',
    message: '选择要输出的语言，空格可多选',
    default: ['zh_TW', 'en']
  },
  {
    type: 'list',
    choices: findSync(ENTRYPATH),
    name: 'select',
    message: '选择一个需要编译的文件',
    default: false
  }
]).then(res => {
  console.log(chalk.cyan('选择的输出语言是：' + res.checked))
  console.log(chalk.cyan('选择的文件是：' + res.select))
  let obj = {}
  res.checked.length > 0 && res.checked.map(lang => {
    obj[lang] = {}
  })
  writeJson(res.select, obj)
})

// 查找文件下文件名列表
function findSync(startPath) {
  let result = [];

  function finder(path) {
    let files = fs.readdirSync(path);
    files.forEach((val) => {
      let fPath = join(path, val);
      let stats = fs.statSync(fPath);
      if (stats.isDirectory()) finder(fPath);
      if (stats.isFile()) result.push(fPath);
    });
  }
  finder(startPath);
  return result;
}

// 写入数据
function writeJson(url, newObj) {
  let selectedName = url.split('/').pop().split('.').shift()
  fs.readFile(url, 'utf8', function (err, data) {
    if (err) {
      return new Error(err);
    }
    var person = JSON.parse(data);
    person = Object.assign({}, person);
    // 是否存在文件夹
    isHasDirectoryMkdir(OUTPATH)

    // 遍历文件反编译
    Object.keys(newObj).map(o => {
      Object.keys(person).map(r => {
        if (!person[r][o]) {
          console.log(chalk.italic.yellowBright(`::${o}格式不正确，请核对！不影响其他文件编译::`))
          return false
        }
        
        newObj[o][r] = person[r][o];
        const jsStr = 'export default ' + JSON.stringify(newObj[o], null, '\t');

        // 是否存在要编译后的en/zh_CN
        isHasDirectoryMkdir(`${OUTPATH}/${o}`)

        const spinner = ora('生成文件中...')
        spinner.start()
        // 写入文件目录
        setTimeout(() => {
          fs.writeFile(`${OUTPATH}/${o}/${selectedName}.js`, jsStr, function (err) {
            if (err) {
              return new Error(err);
            }
            spinner.stop()
            console.log(chalk.green(`已生成 ${OUTPATH}/${o}/${selectedName}.js 完毕`))
          })
        }, 1000)
      })
    })
  })
}

// 是否已经创建过文件夹
function isHasDirectoryMkdir(outFile) {
  fs.exists(outFile, function (exists) {
    if (!exists) fs.mkdirSync(outFile)
  });
}



