
module.exports = {
  outputDir: 'docs',
  baseUrl: '/HashCheck',
  productionSourceMap: false,
  configureWebpack:  {
    output: {
      globalObject: 'this'
    }
  }
}