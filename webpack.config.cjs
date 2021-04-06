const path = require('path')
const fs = require('fs')
const reJsfile = /(.*)(.js(x?))$/

const entry = {}
fs.readdirSync(path.join(__dirname, 'reactApp')).forEach(file => {
  if (reJsfile.test(file)) {
    var name = file.replace(reJsfile, '$1')
    entry[name] = [path.join(__dirname, 'reactApp', file)]
  }
})

console.log('entry', entry)

module.exports = {
  entry: entry,
  devtool: 'source-map',
  output: {
    path: path.join(__dirname, 'public', 'js', 'react'),
    filename: '[name]Pack.js'
  },
  devServer: {
    contentBase: [
      path.join(__dirname, 'public'),
      path.join(__dirname, 'node_modules')
    ],
    compress: true,
    port: 9000,
    watchContentBase: true,
    progress: true
  },

  optimization: {
    splitChunks: {
      cacheGroups: {
        react: {
          test: /node_modules/,
          chunks: 'initial',
          name: 'reactVendor',
          enforce: true
        }
      }
    }
  },

  module: {
    rules: [
      {
        test: /\.js(x?)$/,
        // exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            "plugins": ["@babel/plugin-proposal-class-properties"]
          }
        }
      }, {
        test: /\.js(x?)$/,
        use: {
          loader: 'eslint-loader'
        }
      },
      {
        test: /\.css$/i,
        use: ["style-loader", "css-loader"]
      },
      {
        test: /\.s[ac]ss$/i,
        use: [ "style-loader", "css-loader", "sass-loader" ],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader']
      }
    ]
  }
}
