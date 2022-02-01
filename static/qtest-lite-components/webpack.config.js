const path = require('path');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');

module.exports = function (_env, argv) {
	const isProduction = argv.mode === 'production';
	const isDevelopment = !isProduction;
	const config = {
		entry: ['babel-polyfill'],
		devtool: isDevelopment && 'cheap-module-source-map',
		output: {
			path: path.resolve(__dirname, 'dist'),
			publicPath: '/'
		},
		module: {
			rules: [
				{
					test: /\.jsx?$/,
					exclude: /node_modules/,
					use: {
						loader: 'babel-loader',
						options: {
							cacheDirectory: true,
							cacheCompression: false,
							envName: isProduction ? 'production' : 'development'
						}
					}
				},
				{
					test: /\.css$/,
					use: [isProduction ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader']
				},
				{
					test: /\.(png|jpg|gif)$/i,
					use: {
						loader: 'url-loader',
						options: {
							limit: 8192,
							name: 'static/media/[name].[hash:8].[ext]'
						}
					}
				},
				{
					test: /\.svg$/,
					use: ['@svgr/webpack']
				},
				{
					test: /\.(eot|otf|ttf|woff|woff2)$/,
					loader: require.resolve('file-loader'),
					options: {
						name: 'static/media/[name].[hash:8].[ext]'
					}
				},
				{
					test: /\.scss$/,
					use: [isProduction ? MiniCssExtractPlugin.loader : 'style-loader', 'css-loader', 'sass-loader']
				}
			]
		},
		resolve: {
			extensions: ['.js', '.jsx']
		},
		plugins: [
			isProduction &&
				new MiniCssExtractPlugin({
					filename: 'assets/css/[name].[contenthash:8].css',
					chunkFilename: 'assets/css/[name].[contenthash:8].chunk.css'
				}),
			new HtmlWebpackPlugin({
				template: path.resolve(__dirname, 'public/index.html'),
				inject: true
			}),
			new webpack.DefinePlugin({
				'process.env.NODE_ENV': JSON.stringify(isProduction ? 'production' : 'development')
			})
		].filter(Boolean),
		optimization: {
			minimize: isProduction,
			minimizer: [
				new TerserWebpackPlugin({
					terserOptions: {
						compress: {
							comparisons: false
						},
						mangle: {
							safari10: true
						},
						output: {
							comments: false,
							ascii_only: true
						},
						warnings: false
					}
				}),
				new OptimizeCssAssetsPlugin()
			],
			splitChunks: {
				chunks: 'all',
				minSize: 0,
				maxInitialRequests: 10,
				maxAsyncRequests: 10,
				cacheGroups: {
					vendors: {
						test: /[\\/]node_modules[\\/]/,
						name(module, chunks, cacheGroupKey) {
							const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
							return `${cacheGroupKey}.${packageName.replace('@', '')}`;
						}
					},
					common: {
						minChunks: 2,
						priority: -10
					}
				}
			},
			runtimeChunk: 'single'
		}
	};

	const adminPage = Object.assign({}, config, {
		entry: './src/admin-page/index.js',
		output: {
			path: path.resolve(__dirname, 'dist/admin-page'),
			filename: 'assets/js/[name].[contenthash:8].js'
		}
	});

	// const projectPage = Object.assign({}, config, {
	// 	entry: './src/project-page/index.js',
	// 	output: {
	// 		path: path.resolve(__dirname, 'dist/project-page'),
	// 		filename: 'assets/js/[name].[contenthash:8].js'
	// 	}
	// });

	// const issuePanelTestCase = Object.assign({}, config, {
	// 	entry: './src/issue-panel-test-case/index.js',
	// 	output: {
	// 		path: path.resolve(__dirname, 'dist/issue-panel-test-case'),
	// 		filename: 'assets/js/[name].[contenthash:8].js'
	// 	}
	// });

	// const issuePanelTestRun = Object.assign({}, config, {
	// 	entry: './src/issue-panel-test-run/index.js',
	// 	output: {
	// 		path: path.resolve(__dirname, 'dist/issue-panel-test-run'),
	// 		filename: 'assets/js/[name].[contenthash:8].js'
	// 	}
	// });

	// const issueActivityHistory = Object.assign({}, config, {
	// 	entry: './src/issue-activity-history/index.js',
	// 	output: {
	// 		path: path.resolve(__dirname, 'dist/issue-activity-history'),
	// 		filename: 'assets/js/[name].[contenthash:8].js'
	// 	}
	// });

	// const issuePanelTestCaseExpand = Object.assign({}, config, {
	// 	entry: './src/issue-panel-test-case-expand/index.js',
	// 	output: {
	// 		path: path.resolve(__dirname, 'dist/issue-panel-test-case-expand'),
	// 		filename: 'assets/js/[name].[contenthash:8].js'
	// 	}
	// });

	// const issueAttachmentsModal = Object.assign({}, config, {
	// 	entry: './src/issue-attachments-modal/index.js',
	// 	output: {
	// 		path: path.resolve(__dirname, 'dist/issue-attachments-modal'),
	// 		filename: 'assets/js/[name].[contenthash:8].js'
	// 	}
	// });

	// const issueCallToTestModal = Object.assign({}, config, {
	// 	entry: './src/issue-call-to-test-modal/index.js',
	// 	output: {
	// 		path: path.resolve(__dirname, 'dist/issue-call-to-test-modal'),
	// 		filename: 'assets/js/[name].[contenthash:8].js'
	// 	}
	// });

	// const testExecutionNewCycleModal = Object.assign({}, config, {
	// 	entry: './src/test-execution-new-cycle-modal/index.js',
	// 	output: {
	// 		path: path.resolve(__dirname, 'dist/test-execution-new-cycle-modal'),
	// 		filename: 'assets/js/[name].[contenthash:8].js'
	// 	}
	// });

	// const testDesignNewTestRunModal = Object.assign({}, config, {
	// 	entry: './src/test-design-new-test-run-modal/index.js',
	// 	output: {
	// 		path: path.resolve(__dirname, 'dist/test-design-new-test-run-modal'),
	// 		filename: 'assets/js/[name].[contenthash:8].js'
	// 	}
	// });

	// return [
	// 	adminPage,
	// 	projectPage,
	// 	issuePanelTestCase,
	// 	issuePanelTestRun,
	// 	issueActivityHistory,
	// 	issuePanelTestCaseExpand,
	// 	issueAttachmentsModal,
	// 	issueCallToTestModal,
	// 	testExecutionNewCycleModal,
	// 	testDesignNewTestRunModal
	// ];

	return [
		adminPage
	];
};
