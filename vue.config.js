process.env.VUE_APP_VERSION = require('./package.json').version
process.env.VUE_APP_BUILD_DATE = new Date(Date.now()).toISOString().split('T')[0];

const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: [
    'vuetify'
  ]
})
