<!--
 * @Author: shoestrong
 * @Date: 2019-09-19 19:17:28
 * @Description: file content
 * @LastEditTime: 2019-09-21 02:41:59
 * @LastEditors: shoestrong
 -->
# build-i8n-lang-config
构建i18n中lang配置文件

解决在使用vue-i18n中要手动写入每种语言，避免反复人工操作

使用
```
npm run build // (or node index.js)
```

```
const {BuildI18nLang} = require('build-i8n-lang-config')

// 可配置
const i18nLang = new BuildI18nLang({
  langs: ['zh_CN', 'zh_TW', 'en'],
  defaultLangs: ['zh_CN', 'en'],
  outPath: './lang',
  entryPath: './local'
})
// 设置langs配置，第二个参数确定是否为defaultLangs
i18nLang.setLangs('zh_TW', true)
// 设置出入口路径，第二个参数可设置outPath和entryPath
i18nLang.setPath('./lang', 'outPath')
```

在local文件夹中写入json格式，区分各语言，生成模块会以文件名生成
demo.json
```
{
	"message": {
		"zh_CN": "为i18n而生",
		"en": "Born to i18n",
		"zh_TW": "為i18n而生"
	}
}
```

会生成以下文件目录
```
lang
  --zh_CN
    --demo.js
  --en
    --demo.js
  --zh_TW
    --demo.js
```
文件内容，比如lang/zh_CN/demo.js
```
export default {
	"message": "为i18n而生"
}
```
