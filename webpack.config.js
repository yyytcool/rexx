const path = require('path')

module.exports = {
  entry: './src/index.js',
  output: {
    filename: 'rexx.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'rexx',
    libraryTarget: 'umd',
    libraryExport: 'default',
    umdNamedDefine: true,
    globalObject: 'this'

  },
  mode: 'production',
  plugins: [],
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      }
    ]
  }
}
