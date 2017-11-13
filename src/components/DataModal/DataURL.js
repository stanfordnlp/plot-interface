var React = require('react');
import PropTypes from 'prop-types';

var Loader = React.createClass({
  propTypes: {
    loadURL: PropTypes.func.isRequired
  },

  handleSubmit: function(evt) {
    this.props.loadURL(evt.target.url.value);
    evt.preventDefault();
  },

  render: function() {
    return (
      <form onSubmit={this.handleSubmit}>
        <input type="text" name="url" placeholder="Enter url"/>
        <button type="submit" value="Submit" className="button">Load</button>
      </form>
    );
  }
});

module.exports = Loader;
