const BuildI18nLangConfig = require('../lib/index')

new BuildI18nLangConfig({
  defaultLangs: ['zh_CN', 'en'],
  entryPath: './local',
  outPath: './langs/user'
})