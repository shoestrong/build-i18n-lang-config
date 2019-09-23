/*
 * @Author: shoestrong
 * @Date: 2019-09-19 15:13:28
 * @Description: build-i8n-lang-config 为i18n而生
 * @LastEditTime: 2019-09-23 16:29:05
 * @LastEditors: shoestrong
 */
const fs = require('fs');
const path = require('path')
const inquirer = require('inquirer')
const chalk = require('chalk')
const ora = require('ora');

const {join} = path


class BuildI18nLangConfig {
  constructor(props = {}) {
    this.dirCache = {}
    this.config = {
      langs: ['zh_CN', 'zh_TW', 'en'],
      defaultLangs: ['zh_CN', 'en'],
      outPath: './lang',
      entryPath: './local',
      ...props
    }
    this._init()
  }

  setLangs(lang, isDefault) {
    const lg = isDefault ? 'defaultLangs' : 'langs'
    this.config[lg].push(lang)
  }

  setPath(path, isWhere) {
    if (isWhere !== 'outPath' || isWhere !== 'entryPath') return;
    this.config[isWhere] = path
  }

  _init() {
    this._isHasDirectoryMkdir(this.config.entryPath, true)
    this._filterLangs().then(res => {
      this.defaultLangs = res
      const spinner = ora('检测是否存在local文件夹和配置文件...')
      spinner.start()
      setTimeout(() => {
        spinner.stop()
        // 交互式提示
        inquirer.prompt([{
            type: 'checkbox',
            choices: this.config.langs,
            name: 'checked',
            message: '选择要输出的语言，空格可多选',
            default: this.config.defaultLangs
          },
          {
            type: 'list',
            choices: this._findSync(this.config.entryPath),
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
          this._writeJson(res.select, obj)
        })
      }, 1000)
    }).catch(err => {
      console.log(chalk.cyan(err))
    })
  }

  _filterLangs() {
    return new Promise((resolve, reject) => {
      if (this.config.langs && this.config.langs.length === 0) {
        reject('默认参数langs不能为空')
      } else {
        let newLangs = []
        this.config.defaultLangs.forEach(dlang => {
          this.config.langs.forEach(lang => {
            if (dlang === lang) {
              newLangs.push(lang)
            }
          })
        })
        resolve(newLangs)
      }
    })
  }

  _writeLocalFile(path) {
    const defaultJson = `{
      "message": {
        "zh_CN": "为i18n而生",
        "en": "Born to i18n",
        "zh_TW": "為i18n而生"
      }
    }
    `

    fs.writeFile(`${path}/demo.json`, defaultJson, function (err) {
      if (err) {
        return new Error(err);
      }
      console.log(chalk.green(`生成${path}/demo.json`))
    })
  }

  // 查找文件下文件名列表
  _findSync(startPath) {
    let result = [];
    function finder(path) {
      const files = fs.readdirSync(path);
      files.forEach((val) => {
        const fPath = join(path, val);
        const stats = fs.statSync(fPath);
        if (stats.isDirectory()) finder(fPath);
        if (stats.isFile()) result.push(fPath);
      });
    }
    finder(startPath);
    return result;
  }

  // 写入数据
  _writeJson(url, newObj) {
    const _this = this;
    const selectedName = url.split('/').pop().split('.').shift()
    fs.readFile(url, 'utf8', (err, data) => {
      if (err) {
        return new Error(err);
      }
      let person = JSON.parse(data);
      person = Object.assign({}, person);
      // 是否存在文件夹
      _this._isHasDirectoryMkdir(_this.config.outPath)

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
          _this._isHasDirectoryMkdir(`${_this.config.outPath}/${o}`)

          const spinner = ora('生成文件中...')
          spinner.start()
          // 写入文件目录
          setTimeout(() => {
            fs.writeFile(`${_this.config.outPath}/${o}/${selectedName}.js`, jsStr, function (err) {
              if (err) {
                console.log(err)
              } else {
                console.log(chalk.green(`已生成 ${_this.config.outPath}/${o}/${selectedName}.js 完毕`))
              }
              spinner.stop()
            })
          }, 1000)
        })
      })
    })
  }
  
  // 是否已经创建过文件夹
  _isHasDirectoryMkdir(outPath, is) {
    fs.exists(outPath, exists => {
      if (!exists) {
        // fs.mkdirSync(outPath)
        this._mkdir(outPath)
        if (is) {
          this._writeLocalFile(outPath)
        }
      }
    });
  }

  // 递归创建文件夹
  _mkdir(dirname) {
    if (fs.existsSync(dirname)) {
      return true;
    } else {
      if (this._mkdir(path.dirname(dirname))) {
        fs.mkdirSync(dirname);
        return true;
      }
    }
  }
}

module.exports = BuildI18nLangConfig
