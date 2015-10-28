var React = require('react');

var Section = require('grommet/components/Section');

var YANCalculator = React.createClass({

  getInitialState: function() {
    return {
    };
  },

  render: function () {

    return (
      <Section primary={true}>
        <p>Here be Yeast Calculator</p>
      </Section>
    );
  }
});

module.exports = YANCalculator;
