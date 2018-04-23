const { version } = require('./package.json');

module.exports = {
  title: `GFW Components | ${version}`,
  template: './styleguide.template.html',
  components: 'app/javascript/components/*/*.jsx',
  webpackConfig: require('./config/webpack/production'),
  skipComponentsWithoutExample: true
};
