const { join } = require('path');

module.exports = {
  webpack : (config) => {
    config.resolve = {
      ...config.resolve,
      alias : {
        '#components' : join(__dirname, 'src', 'components'),
        '#constants'  : join(__dirname, 'src', 'constants'),
        '#hooks'      : join(__dirname, 'src', 'hooks'),
        '#init'       : join(__dirname, 'src', 'init'),
        '#layouts'    : join(__dirname, 'src', 'layouts'),
        '#pages'      : join(__dirname, 'src', 'pages'),
        '#services'   : join(__dirname, 'src', 'services'),
        '#theme'      : join(__dirname, 'src', 'theme'),
        '#utils'      : join(__dirname, 'src', 'utils'),
      },
    };

    return config;
  },
};
