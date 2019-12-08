var express = require('express')
var path = require('path')
var expressStaticGzip = require("express-static-gzip");

var app = express()
var indexRouter = require('./routes/index') // This one is for our frontent application
var apiRouter = require('./routes/api') // This one is for our backend APIs

// view engine setup
app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')));

app.use('/dist/bundle', expressStaticGzip(path.join(__dirname, 'dist/bundle'), {
  enableBrotli: true,
  orderPreference: ['br', 'gz'],
  setHeaders: function (res, path) {
    res.setHeader("Cache-Control", "public, max-age=31536000")
  }
}));

// Using webpack for our development
if (process.env.NODE_ENV === "development") {
  var webpack = require("webpack");
  var webpackConfig = require("./webpack.config");
  var compiler = webpack(webpackConfig);

  app.use(
    require("webpack-dev-middleware")(compiler, {
      noInfo: true,
      publicPath: webpackConfig.output.publicPath
    })
  );

  app.use(require("webpack-hot-middleware")(compiler))
} else {
  var webpack = require("webpack");
  var webpackConfig = require("./webpack.config.prod");
  var compiler = webpack(webpackConfig);

  app.use(
    require("webpack-dev-middleware")(compiler, {
      noInfo: true,
      publicPath: webpackConfig.output.publicPath
    })
  );
}

// Route handler
app.use('/api/v1', apiRouter) // api route handler
app.use('/', indexRouter); // react handler

module.exports = app