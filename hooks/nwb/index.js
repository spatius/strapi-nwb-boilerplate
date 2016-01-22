'use strict';

var fs = require("fs");

var webpack = require('webpack')

var createServeReactAppConfig = require('nwb/lib/createServeReactAppConfig')
var createServeReactAppBuildConfig = require('nwb/lib/createServeReactAppBuildConfig')
var createServerWebpackConfig = require('nwb/lib/createServerWebpackConfig')
var debug = require('nwb/lib/debug')

var readFileThunk = function(src) {
  return new Promise(function (resolve, reject) {
    fs.readFile(src, {'encoding': 'utf8'}, function (err, data) {
      if(err) return reject(err);
      resolve(data);
    });
  });
}

module.exports = function(strapi) {
  // const router = strapi.middlewares.router();

  var options = {
    autoInstall: true,
    reload: true
  };

  var args = {}
  args.info = !!options.info
  args['auto-install'] = !!options.autoInstall

  var webpackConfig = createServerWebpackConfig(
    args,
    createServeReactAppBuildConfig(
      createServeReactAppConfig()
    )
  )

  debug('webpack config: %o', webpackConfig)

  var compiler = webpack(webpackConfig)

  strapi.app.use(require('koa-webpack-dev-middleware')(compiler, {
    noInfo: !args.info,
    publicPath: webpackConfig.output.publicPath,
    stats: {
      colors: true
    }
  }));

  strapi.app.use(require('koa-webpack-hot-middleware')(compiler));

  // router.get("*", function*(next) {
  //   this.body = yield readFileThunk('public/index.html');
  //   yield next;
  // });

  strapi.app.use(function*() {
    this.body = yield readFileThunk('public/index.html');
  });
}
