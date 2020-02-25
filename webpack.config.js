const path = require('path');
const exec = require('child_process').exec;

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

function execute(commands) {
  exec(commands.join(';'), (err, stdout, stderr) => {
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
  });
}
function log(msg) {
  exec(`echo "${msg}"`, (err, stdout, stderr) => {
    if (stdout) process.stdout.write(stdout);
    if (stderr) process.stderr.write(stderr);
  });
}

module.exports = env => {
  return {
    entry: './script/index.ts',
    output: {
      filename: 'bundle.js',
      path: path.resolve(__dirname, './dist')
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.tsx?$/,
          use: ['ts-loader'],
          exclude: /node_modules/
        }
      ]
    },
    resolve: {
      extensions: [ '.tsx', '.ts', '.js' ]
    },
    plugins: [
      new HtmlWebpackPlugin({
        template: 'template/index.html',
        inject: 'body',
        filename: 'index.html'
      }),
      {
        apply: compiler => {
          compiler.hooks.afterEmit.tap('AfterEmitPlugin', compilation => {
            if (!env) {
              log('Environment was not specified. Add --env.commit to commit');
              return;
            }
            if (env.commit) {
              const repoUrl = JSON.stringify(require("./package.json").repository.url);
              execute([`bash ./build.sh "${repoUrl}" "${new Date().toString()}"`]);
            }
          });
        }
      }
    ]
  };
};
