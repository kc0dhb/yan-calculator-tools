require('../scss/index.scss');

var React = require('react');
var ReactDOM = require('react-dom');
var App = require('grommet/components/App');
var Footer = require('grommet/components/Footer');
var Title = require('grommet/components/Title');
var Header = require('grommet/components/Header');
var YANCalculator = require('./components/YANCalculator');

var Main = React.createClass({
  render: function() {
    //TODO add a header?
    //TODO get footer to float to bottom?
    return (
      <App centered={false}>
        <Header className="no-print" appCentered={true} colorIndex="grey-1">
          <Title>YAN Calculator</Title>
        </Header>
        <YANCalculator />
        <Footer className="no-print" appCentered={false} direction="column" align="end" pad={{horizontal: 'small'}} colorIndex="grey-1">
          <div>Fork it on <a href="https://github.com/kc0dhb/yan-calculator-tools" target="_blank">github</a>!</div>
        </Footer>
      </App>
    );
  }
});

var element = document.getElementById('content');
ReactDOM.render(React.createElement(Main), element);

document.body.classList.remove('loading');
