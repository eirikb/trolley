module.exports = {
  node: {fs: 'empty'},
  output: {
    library: 'trolley',
    libraryTarget: 'umd',
    filename: 'trolley.min.js',
    globalObject: `typeof window !== 'undefined' ? window: global`,
    libraryExport: 'default'
  }
};