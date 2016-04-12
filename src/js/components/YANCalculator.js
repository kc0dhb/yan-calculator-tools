var React = require('react');

var Section = require('grommet/components/Section');
var Header = require('grommet/components/Section');
var Table = require('grommet/components/Table');
var Form = require('grommet/components/Form');
var FormField = require('grommet/components/FormField');
var CheckBox = require('grommet/components/CheckBox');

var Tiles = require('grommet/components/Tiles');
var Tile = require('grommet/components/Tile');


var SG_PROPERTIES = {
  type: "number",
  min: "0",
  step: ".001"
};

// nutrient provides ppm per g/L
var nutrients = {
  fermaid_K: {
    organic: 65,
    inorganic: 65
  },
  fermaid_O: {
    organic: 65,
    inorganic: 0
  },
  dap: {
    organic: 0,
    inorganic: 210
  }
};

var SIMPLE_FIELDS = ['gravity', 'fermaid_K', 'fermaid_O', 'dap'];

// in order
var FIELD_LABELS = {
  gravity: 'Gravity (sg)',
  fermaid_K_split: 'Fermaid K (%)',
  fermaid_K: 'Fermaid K (g)',
  fermaid_K_YAN: 'Fermaid K YAN (ppm)',
  fermaid_O_split: 'Fermaid O (%)',
  fermaid_O: 'Fermaid O (g)',
  fermaid_O_YAN: 'Fermaid O YAN (ppm)',
  blank_row: '',
  dap_split: 'DAP (%)',
  dap: 'DAP (g)',
  dap_YAN: 'DAP YAN (ppm)'
};

var YANCalculator = React.createClass({

  getInitialState: function() {
    return {
      table : false,

      final_gravity: 0.997,
      original_gravity: 1.100,
      gravity_units: 'sg',
      volume: 20,
      volume_units: 'liter',
      target_yan: 250,
      // target_yan_units: PPM
      organic_ratio: 35,
      use_fermaid_k: false,

      // TODO convert split to generic
      // TODO make split editable...
      steps: [{
        name: 'At Mix',
        when: 0,
        allow_DAP: false,
        dap_split: 0,
        fermaid_K_split: 0,
        fermaid_O_split: 40
      },{
        name: 'End of Lag',
        when: 0,
        dap_split: 50,
        fermaid_K_split: 50,
        fermaid_O_split: 20
      },{
        name: '1/6 Sugar Break',
        when: 1/6,
        dap_split: 40,
        fermaid_K_split: 30,
        fermaid_O_split: 20
      },{
        name: '1/3 Sugar Break',
        when: 1/3,
        dap_split: 10,
        fermaid_K_split: 20,
        fermaid_O_split: 20
      },{
        total: true,
        name: 'Total',
        dap_split: null,
        fermaid_K_split: null,
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

  _calculateStepTotals : function(step, totals) {
    var stepSummary = {};
    if (!step.total) {
      // TODO do some abstractions
      if (this.state.use_fermaid_k) {
        stepSummary.fermaid_K_split = (step.fermaid_K_split/totals.fermaid_K_split*100).toFixed(2);
        stepSummary.fermaid_K_YAN = (totals.fermaid_K_YAN*step.fermaid_K_split/100).toFixed(2);
        stepSummary.fermaid_K = (stepSummary.fermaid_K_YAN*this.state.volume/nutrients.fermaid_K.organic/2).toFixed(2);
      } else {
        stepSummary.fermaid_O_split = (step.fermaid_O_split/totals.fermaid_O_split*100).toFixed(2);
        stepSummary.fermaid_O_YAN = (totals.fermaid_O_YAN*step.fermaid_O_split/100).toFixed(2);
        stepSummary.fermaid_O = (stepSummary.fermaid_O_YAN*this.state.volume/nutrients.fermaid_O.organic).toFixed(2);
      }

      stepSummary.dap_split = (step.dap_split/totals.dap_split*100).toFixed(2);
      stepSummary.dap_YAN = (totals.dap_YAN*step.dap_split/100).toFixed(2);
      stepSummary.dap = (stepSummary.dap_YAN*this.state.volume/nutrients.dap.inorganic).toFixed(2);

      stepSummary.gravity = (this.state.original_gravity - (totals.gravity * step.when)).toFixed(3);
    } else {
      // TODO do some abstractions
      if (this.state.use_fermaid_k) {
        stepSummary.fermaid_K_split = 100;
        stepSummary.fermaid_K_YAN = (totals.fermaid_K_YAN).toFixed(2);
        stepSummary.fermaid_K = (stepSummary.fermaid_K_YAN*this.state.volume/nutrients.fermaid_K.organic/2).toFixed(2);
      } else {
        stepSummary.fermaid_O_split = 100;
        stepSummary.fermaid_O_YAN = (totals.fermaid_O_YAN).toFixed(2);
        stepSummary.fermaid_O = (stepSummary.fermaid_O_YAN*this.state.volume/nutrients.fermaid_O.organic).toFixed(2);
      }
      stepSummary.dap_split = 100;
      stepSummary.dap_YAN = (totals.dap_YAN).toFixed(2);
      stepSummary.dap = (stepSummary.dap_YAN*this.state.volume/nutrients.dap.inorganic).toFixed(2);

      stepSummary.gravity = "N/A";
    }
    return stepSummary;
  },

  _getStepSummaries: function() {
    var totals;
    // TODO abstract this nicer
    if (this.state.use_fermaid_k) {
      totals = {
        fermaid_K_split : 0,
        dap_split : 0,
        gravity : this.state.original_gravity - this.state.final_gravity,
        dap_YAN : this.state.target_yan * ((100 - this.state.organic_ratio)/100) - this.state.target_yan * (this.state.organic_ratio/100),
        fermaid_K_YAN: this.state.target_yan * (this.state.organic_ratio/100)*2
      };
      for (var i = this.state.steps.length - 1; i >= 0; i--) {
        totals.fermaid_K_split+=this.state.steps[i].fermaid_K_split;
        totals.dap_split+=this.state.steps[i].dap_split;
      };

    } else {
      totals = {
        fermaid_O_split : 0,
        dap_split : 0,
        gravity : this.state.original_gravity - this.state.final_gravity,
        dap_YAN : this.state.target_yan * ((100 - this.state.organic_ratio)/100),
        fermaid_O_YAN: this.state.target_yan * (this.state.organic_ratio/100)
      };
      for (var i = this.state.steps.length - 1; i >= 0; i--) {
        totals.fermaid_O_split+=this.state.steps[i].fermaid_O_split;
        totals.dap_split+=this.state.steps[i].dap_split;
      };

    }
    var stepSummaries = [];
    for (var i = 0; i < this.state.steps.length; i++) {
      stepSummaries.push(this._calculateStepTotals(this.state.steps[i], totals));
    }
    return stepSummaries;
  },

  renderTable: function() {
    var stepSummaries = this._getStepSummaries();

    var headers = [<th>Nutrient</th>];
    for (var i = 0; i < this.state.steps.length; i++) {
      headers.push(<th>{this.state.steps[i].name}</th>);
    }

    var body = {};
    for (var field in FIELD_LABELS) {
      body[field] = [<td>{FIELD_LABELS[field]}</td>];
    }

    for (var i = 0; i < stepSummaries.length; i++) {
      var stepSummary = stepSummaries[i];

      for (var key in stepSummary) {
        body[key].push(<td>{stepSummary[key]}</td>);
      }
    };

    var renderedBody =[];
    for (var part in body) {
      if (this.shouldShow(part)) {
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

  shouldShow: function(field) {
    return (field.indexOf(this.state.use_fermaid_k ? 'fermaid_K' : 'fermaid_O') !== -1 || field.indexOf('fermaid_') === -1)
      && (SIMPLE_FIELDS.indexOf(field) !== -1 || this.state.details);
  },

  renderFlat: function() {
    var stepSummaries = this._getStepSummaries();
    var steps = [];

    for (var i = 0; i < this.state.steps.length; i++) {
      var step = this.state.steps[i];

      var body = [];
      for (var field in FIELD_LABELS) {
        if (this.shouldShow(field)) {
          body.push(
            <tr>
              <td>{FIELD_LABELS[field]}</td>
              <td>{stepSummaries[i][field]}</td>
            </tr>
          );
        }
      }

      steps.push(
        <Tile className="summary-tile">
          <Header pad="none" tag="h3">{step.name}</Header>
          <Table>
            <tbody>
              {body}
            </tbody>
          </Table>
        </Tile>
      );
    };
    return (
      <Tiles pad="none" flush={false}>
        {this.renderPrintTile()}
        {steps}
      </Tiles>
    );
  },

  renderOutput: function() {
    return this.state.table ? this.renderTable() : this.renderFlat();
  },
  getInputTable: function() {
    return (
      <Table>
        <tbody>
          <tr>
            <td>Volume (liters)</td>
            <td>{(1*this.state.volume).toFixed(2)}</td>
          </tr>
          <tr>
            <td>Original Gravity (sg)</td>
            <td>{(1*this.state.original_gravity).toFixed(3)}</td>
          </tr>
          <tr>
            <td>Final Gravity (sg)</td>
            <td>{(1*this.state.final_gravity).toFixed(3)}</td>
          </tr>
          <tr>
            <td>YAN (ppm)</td>
            <td>{this.state.target_yan}</td>
          </tr>
          <tr>
            <td>Organic Percentage (%)</td>
            <td>{this.state.organic_ratio}</td>
          </tr>
        </tbody>
      </Table>

    );
  },

  renderPrintTile: function() {
    return (
      <Tile className="print summary-tile">
        <Header pad="none" tag="h3">Essentials</Header>
        {this.getInputTable()}
      </Tile>
    );
  },

  renderForm: function() {
    return (
      <Form onSubmit={this._onFormSubmit}>
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
          <input id="organic_ratio" min="0" max="50" type="number" onChange={this._onChange} value={this.state.organic_ratio}/>
        </FormField>
        <FormField htmlFor="use_fermaid_k" help="Choose to use Fermaid K over Fermaid O">
          <CheckBox id="use_fermaid_k" name="use_fermaid_k" label="Use Fermaid K" checked={this.state.use_fermaid_k} onChange={this._onChangeCheckBox}/>
        </FormField>
        <FormField htmlFor="details" help="To see more details in the output">
          <CheckBox id="details" name="details" label="Show Details" checked={this.state.details} onChange={this._onChangeCheckBox}/>
        </FormField>
        <FormField htmlFor="table">
          <CheckBox id="table" name="table" label="Show as Table" checked={this.state.table} onChange={this._onChangeCheckBox}/>
        </FormField>

      </Form>
    );
  },

  render: function() {
    var input;
    if (this.state.table) {
      input = this.renderPrintTile();
    }
    return (
      <Section primary={true} pad="medium">
        <Section pad="none" className="no-print" key="inputs">
          {this.renderForm()}
        </Section>
        <Section pad="none" className="print" key="print-input">
          {input}
        </Section>
        <Section pad="none" key="outputs">
          {this.renderOutput()}
        </Section>
      </Section>
    );
  }
});

module.exports = YANCalculator;
