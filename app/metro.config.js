/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const {getDefaultConfig} = require("metro-config");

// module.exports = {
//   transformer: {
//     getTransformOptions: async () => ({
//       transform: {
//         experimentalImportSupport: false,
//         inlineRequires: false,
//       },
//     }),
//   },
// };

const path = require('path');
const extraNodeModules = {
  'client': path.resolve(__dirname + '/../client'),
};
const watchFolders = [
  path.resolve(__dirname + '/../client')
];

module.exports = (async () => {
  const {
    resolver: {sourceExts, assetExts}
  } = await getDefaultConfig();

  return {
    transformer: {
      babelTransformerPath: require.resolve('react-native-svg-transformer'),
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: false,
        },
      }),
    },
    resolver: {
      assetExts: assetExts.filter(ext => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg'],
      extraNodeModules: new Proxy(extraNodeModules, {
        get: (target, name) =>
            //redirects dependencies referenced from common/ to local node_modules
            name in target ? target[name] : path.join(process.cwd(), `node_modules/${name}`),
      }),
    },
    watchFolders
  }
})();
