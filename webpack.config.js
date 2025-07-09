const path = require('path');

const baseConfig = {
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
};

module.exports = [
  {
    ...baseConfig,
    entry: './src/index.ts',
    output: {
      path: path.resolve(__dirname, 'dist/umd'),
      filename: 'index.js',
      library: 'passwordManager',
      libraryTarget: 'umd',
      globalObject: 'this',
    },
  },
  {
    ...baseConfig,
    entry: './src/index.ts',
    output: {
      path: path.resolve(__dirname, 'dist/cjs'),
      filename: 'index.js',
      library: 'passwordManager',
      libraryTarget: 'commonjs2',
    },
  },
  {
    ...baseConfig,
    entry: './src/index.ts',
    output: {
      path: path.resolve(__dirname, 'dist/esm'),
      filename: 'index.js',
      library: 'passwordManager',
      libraryTarget: 'module',
    },
    experiments: {
      outputModule: true,
    },
  },
];
