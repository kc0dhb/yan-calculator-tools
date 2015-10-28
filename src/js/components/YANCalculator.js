var React = require('react');

var Section = require('grommet/components/Section');
var Table = require('grommet/components/Table');
var Form = require('grommet/components/Form');
var FormField = require('grommet/components/FormField');
var CheckBox = require('grommet/components/CheckBox');

var SG_PROPERTIES = {
  type: "number",
  min: "0",
  step: ".001"
};

// nutrient provides ppm per g/L
var nutrients = {
  fermaid_O: {
    organic: 65,
    inorganic: 0
  },
  dap: {
    organic: 0,
    inorganic: 210
  }
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
      organic_ratio: 30,

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

  _onChangeCheckBox:function(event) {
    var change = {};
    change[event.target.id] = event.target.checked;
    this.setState(change);
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
      gravity: [<td>At Gravity (sg)</td>],
      fermaid_O_split: [<td>Fermaid O (%)</td>],
      fermaid_O: [<td>Fermaid O (g)</td>],
      fermaid_O_YAN:[<td>Fermaid O YAN (ppm)</td>],
      dap_split: [<td>DAP (%)</td>],
      dap: [<td>DAP (g)</td>],
      dap_YAN:[<td>DAP YAN (ppm)</td>]
    };
    var simple=['gravity', 'fermaid_O', 'dap'];
    var total_yan = {
      dap: this.state.target_yan * ((100 - this.state.organic_ratio)/100),
      fermaid_O: this.state.target_yan * (this.state.organic_ratio/100)
    };

    for (var i = 0; i < this.state.steps.length; i++) {
      var step = this.state.steps[i];
      headers.push(<th>{step.name}</th>);

      //percentages
      if (!step.total) {
        //TODO do some abstractions
        body.fermaid_O_split.push(<td>{(step.fermaid_O_split/total.fermaid_O_split*100).toFixed(2)+'%'}</td>);
        body.dap_split.push(<td>{(step.dap_split/total.dap_split*100).toFixed(2)+'%'}</td>);

        var dap_YAN = total_yan.dap*step.dap_split/100;
        var fermaid_YAN = total_yan.fermaid_O*step.fermaid_O_split/100;

        body.dap_YAN.push(<td>{(dap_YAN).toFixed(2)}</td>);
        body.dap.push(<td>{(dap_YAN*this.state.volume/nutrients.dap.inorganic).toFixed(2)}</td>);

        body.fermaid_O_YAN.push(<td>{(fermaid_YAN).toFixed(2)}</td>);
        body.fermaid_O.push(<td>{(fermaid_YAN*this.state.volume/nutrients.fermaid_O.organic).toFixed(2)}</td>);

        //TODO round properly
        body.gravity.push(<td>{(this.state.original_gravity - (total_gravity_points * step.when)).toFixed(3)}</td>);
      } else {
        body.fermaid_O_split.push(<td>{'100%'}</td>);
        body.dap_split.push(<td>{'100%'}</td>);

        body.dap_YAN.push(<td>{total_yan.dap}</td>);
        body.dap.push(<td>{(total_yan.dap*this.state.volume/nutrients.dap.inorganic).toFixed(2)}</td>);

        body.fermaid_O_YAN.push(<td>{total_yan.fermaid_O}</td>);
        body.fermaid_O.push(<td>{(total_yan.fermaid_O*this.state.volume/nutrients.fermaid_O.organic).toFixed(2)}</td>);


        body.gravity.push(<td>N/A</td>);
      }

      // gravities

    };
    var renderedBody =[];
    for (var part in body) {
      if (simple.indexOf(part) !== -1 || this.state.details) {
        renderedBody.push(<tr>{body[part]}</tr>);
      }
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
      <Form compact={true} onSubmit={this._onFormSubmit}>
        <FormField label="Volume (liters)" htmlFor="volume" >
          <input id="volume" type="number" onChange={this._onChange} value={this.state.volume}/>
        </FormField>
        <FormField label="Original Gravity (sg)" htmlFor="original_gravity" >
          <input id="original_gravity" {...SG_PROPERTIES} onChange={this._onChange} value={this.state.original_gravity}/>
        </FormField>
        <FormField label="Final Gravity (sg)" htmlFor="final_gravity" >
          <input id="final_gravity" {...SG_PROPERTIES} onChange={this._onChange} value={this.state.final_gravity}/>
        </FormField>
        <FormField label="YAN (ppm)" htmlFor="target_yan" help="225 is a good minimum for low nutrient yeast, 450 a max for high nutrient yeast">
          <input id="target_yan" type="number" onChange={this._onChange} value={this.state.target_yan}/>
        </FormField>
        <FormField label="Organic Percentage (%)" htmlFor="organic_ratio" help="Organic is more expensive, inorganic can cause more yeast blooms">
          <input id="organic_ratio" min="0" max="100" type="number" onChange={this._onChange} value={this.state.organic_ratio}/>
        </FormField>
        <FormField htmlFor="details" help="To see more details in the output table">
          <CheckBox id="details" toggle={true} name="details" label="Show Details" checked={this.state.details} onChange={this._onChangeCheckBox}/>
        </FormField>
      </Form>
    );
  },

  render: function() {

    return (
      <Section primary={true} pad="medium">
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
