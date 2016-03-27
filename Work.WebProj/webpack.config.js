var path = require('path');
var webpack = require('webpack');
//var node_modules_dir = path.resolve(__dirname, 'node_modules');
module.exports = {
    entry: {
        //基礎功能
        //m_menu: path.resolve(__dirname, 'Scripts/src/tsx/m-menu.js'),
        //m_menu_set: path.resolve(__dirname, 'Scripts/src/tsx/m-menu_set.js'),
        //m_login: path.resolve(__dirname, 'Scripts/src/tsx/m-login.js'),
        //m_roles: path.resolve(__dirname, 'Scripts/src/tsx/m-roles.js'),
        //m_change_password: path.resolve(__dirname, 'Scripts/src/tsx/m-change_password.js'),
        //m_users: path.resolve(__dirname, 'Scripts/src/tsx/m-users.js'),
        //後台 管理者
        m_Home: path.resolve(__dirname, 'Scripts/src/jsx/m-Home.jsx'),
        vendors: ['jquery', 'react', 'react-bootstrap', 'moment']
    },
    output: {
        path: path.resolve(__dirname, 'Scripts/build/app'),
        filename: '[name].js'
    },
    module: {
        loaders: [
          { test: /\.jsx$/, loader: 'babel', query: { presets: ['react', 'es2015'] } },
          { test: /\.css$/, loader: "style-loader!css-loader" }
        ]
    },
    resolve: {
        alias: {
            moment: "moment/moment.js"
        },
        modulesDirectories: ["app_modules", "node_modules"],
        extensions: ['', '.js', 'jsx', '.json']
    },
    plugins: [
      new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js'),
      new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /zh-tw/),
      //new webpack.optimize.UglifyJsPlugin({ compress: { warnings: false } })
    ]
};