const nodeExternals = require("webpack-node-externals");
var path = require('path')
var webpack = require('webpack')

module.exports = {
	entry : "./src/options/js/components/components-build.js",
	output : {
		path : path.resolve(__dirname, './src/options/js'),
		publicPath : 'js/',
		filename : 'components.js'
	},
	module : {
		rules : [{
				test : /\.vue$/,
				loader : 'vue-loader',
				options : {
					// vue-loader options go here
				}
			}
		]
	},
	resolve : {
		alias : {
			'vue$' : 'vue/dist/vue'
		}
	},
	devServer : {
		historyApiFallback : true,
		noInfo : true
	},
	devtool : '#source-map',
	plugins : [
		new webpack.optimize.UglifyJsPlugin({
			sourceMap : true,
			compress : {
				warnings : false
			}
		}),
		new webpack.LoaderOptionsPlugin({
			minimize : true
		})
	],
	externals: [nodeExternals()],
	target: 'web'
}
