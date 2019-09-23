/*
 * @Author: shoestrong
 * @Date: 2019-09-23 12:00:33
 * @Description: file content
 * @LastEditTime: 2019-09-23 16:31:32
 * @LastEditors: shoestrong
 */
const BuildI18nLangConfig = require('../index')

new BuildI18nLangConfig({
  defaultLangs: ['zh_CN', 'en'],
  entryPath: './local',
  outPath: './user/langs'
})