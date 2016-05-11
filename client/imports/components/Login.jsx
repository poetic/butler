import React, {Component} from 'react';
import { Meteor } from 'meteor/meteor';
import ReactDOM from 'react-dom';
import { Template } from 'meteor/templating';
import { Blaze } from 'meteor/blaze';
import { Router, browserHistory} from 'react-router';

export default class Login extends Component {

  constructor(props, context) {
    super(props);
  }

  componentDidMount() {

    // Use Meteor Blaze to render login buttons
    this.view = Blaze.render(Template.loginButtons,
      ReactDOM.findDOMNode(this.refs.container));
  }

  componentWillUnmount() {
    // Clean up Blaze view
    Blaze.remove(this.view);
  }

  render() {
    // Just render a placeholder container that will be filled in
    return (

      <div className="login-wrapper">
        <span ref="container" />
      </div>
    );
  }
}
