var React = require('react');

var Section = require('grommet/components/Section');
var Table = require('grommet/components/Table');
var Form = require('grommet/components/Form');
var FormField = require('grommet/components/FormField');

var SG_PROPERTIES = {
  type: "number",
  min: "0",
  step: ".001"
};

var YANCalculator = React.createClass({

  getInitialState: function() {
    return {
      final_gravity: 0.997,
      original_gravity: 1.100,
      gravity_units: 'sg',
      volume: 20,
      volume_units: 'liter',
      target_yan: 250,
      // target_yan_units: PPM
      organic_ratio: 40,

      // TODO convert split to generic
      // TODO make split editable...
      steps: [{
        name: 'At Mix',
        when: 0,
        allow_DAP: false,
        dap_split: 0,
        fermaid_O_split: 25
      },{
        name: 'End of Lag',
        when: 0,
        dap_split: 50,
        fermaid_O_split: 25
      },{
        name: '1/6 Sugar Break',
        when: 1/6,
        dap_split: 40,
        fermaid_O_split: 30
      },{
        name: '1/3 Sugar Break',
        when: 1/3,
        dap_split: 10,
        fermaid_O_split: 20
      },{
        total: true,
        name: 'TOTAL',
        dap_split: null,
        fermaid_O_split: null
      }]
      //TODO other properties to do later
      // types of nutrients
      // organic/inorganic ration
      // how many additions

    };
  },

  _onFormSubmit: function(event) {
    event.preventDefault();
  },

  _onChange: function(event) {
    var change = {};
    change[event.target.id] = event.target.value;
    this.setState(change);
  },

  renderTable: function() {
    var headers = [<th>Nutrient</th>];
    var total = {
      fermaid_O_split : 0,
      dap_split : 0
    };
    for (var i = this.state.steps.length - 1; i >= 0; i--) {
      total.fermaid_O_split+=this.state.steps[i].fermaid_O_split;
      total.dap_split+=this.state.steps[i].dap_split;
    };
    var total_gravity_points = this.state.original_gravity - this.state.final_gravity;
    var body = {
      gravity: [<td>At Gravity</td>],
      fermaid_O_split: [<td>Fermaid O Split</td>],
      fermaid_O: [<td>Fermaid O</td>],
      fermaid_O_YAN:[<td>Fermaid O YAN</td>],
      dap_split: [<td>DAP Split</td>],
      dap: [<td>DAP</td>],
      dap_YAN:[<td>DAP YAN</td>]
    };

    for (var i = 0; i < this.state.steps.length; i++) {
      var step = this.state.steps[i];
      headers.push(<th>{step.name}</th>);

      //percentages
      if (!step.total) {
        body.fermaid_O_split.push(<td>{(step.fermaid_O_split/total.fermaid_O_split*100).toFixed(2)+'%'}</td>);
        body.dap_split.push(<td>{(step.dap_split/total.dap_split*100).toFixed(2)+'%'}</td>);
        //TODO round properly
        body.gravity.push(<td>{(this.state.original_gravity - (total_gravity_points * step.when)).toFixed(3)}</td>);
      } else {
        body.fermaid_O_split.push(<td>{'100%'}</td>);
        body.dap_split.push(<td>{'100%'}</td>);
        body.gravity.push(<td>N/A</td>);
      }

      // gravities

    };
    var renderedBody =[];
    for (var part in body) {
      renderedBody.push(<tr>{body[part]}</tr>);
    }
    return (
      <Table>
        <thead>
          <tr>
            {headers}
          </tr>
        </thead>
        <tbody>
        {renderedBody}
        </tbody>
      </Table>
    );
  },

  renderForm: function() {
    return (
      <Form compact="true" onSubmit={this._onFormSubmit}>
        <FormField label="Volume" htmlFor="volume" >
          <input id="volume" type="number" onChange={this._onChange} value={this.state.volume}/>
        </FormField>
        <FormField label="Original Gravity" htmlFor="original_gravity" >
          <input id="original_gravity" {...SG_PROPERTIES} onChange={this._onChange} value={this.state.original_gravity}/>
        </FormField>
        <FormField label="Final Gravity" htmlFor="final_gravity" >
          <input id="final_gravity" {...SG_PROPERTIES} onChange={this._onChange} value={this.state.final_gravity}/>
        </FormField>
        <FormField label="YAN" htmlFor="target_yan" >
          <input id="target_yan" type="number" onChange={this._onChange} value={this.state.target_yan}/>
        </FormField>
        <FormField label="Organic Percentage" htmlFor="organic_ratio" >
          <input id="organic_ratio" min="0" max="100" type="number" onChange={this._onChange} value={this.state.organic_ratio}/>
        </FormField>
      </Form>
    );
  },

  render: function() {

    return (
      <Section primary={true} direction="row" pad="medium">
        <Section key="inputs">
          <p>Here be Inputs</p>
          {this.renderForm()}
        </Section>
        <Section key="outputs" pad="medium">
          <p>Here be Outputs</p>
          {this.renderTable()}
        </Section>
      </Section>
    );
  }
});

module.exports = YANCalculator;
