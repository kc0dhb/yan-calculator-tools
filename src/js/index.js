require('../scss/index.scss');

var React = require('react');
var App = require('grommet/components/App');
var Footer = require('grommet/components/Footer');
var Header = require('grommet/components/Header');
var YANCalculator = require('./components/YANCalculator');

var Main = React.createClass({
  render: function() {
    //TODO add a header?
    //TODO get footer to float to bottom?
    return (
      <App centered={false}>
        <Header appCentered={false} direction="column"
          align="center" pad="small" colorIndex="grey-1">
          <p>YAN Calculator</p>
        </Header>
        <YANCalculator />
        <Footer appCentered={false} direction="column"
          align="end" pad="small" colorIndex="grey-1">
          <p>Fork it on <a href="https://github.com/kc0dhb/yan-calculator-tools" target="_blank">github</a>!</p>
        </Footer>
      </App>
    );
  }
});

var element = document.getElementById('content');
React.render(React.createElement(Main), element);

document.body.classList.remove('loading');
