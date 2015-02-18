import Ember from 'ember';

export default Ember.Component.extend({
  /**
   * @type {string}
   */
  tagName: 'form',

  /**
   * @type {Array}
   */
  attributeBindings: ['novalidate'],

  /**
   * Prevent the built-in browser navigation error messages to pop up
   *
   * @type {string}
   */
  novalidate: 'novalidate',

  /**
   * Optional Ember-Data model from where to fetch server-side errors
   *
   * @type {DS.Model|null}
   */
  model: null,

  /**
   * Send the action bound to the submit event if the form is valid
   *
   * @returns {boolean}
   */
  submit: function() {
    var form = this.get('element');

    if (form.checkValidity()) {
      this.sendAction('action', this.get('model'));
    } else {
      this.scrollToFirstError();
    }

    return false;
  },

  /**
   * Alias the enter button to submit the form
   *
   * @returns {boolean}
   */
  keyDown: function(event) {
    // Enter key
    if (event.keyCode === 13 && event.target.tagName.toLowerCase() !== 'textarea') {
      this.submit();

      // Prevent other buttons to accidentally submit
      event.preventDefault();
      return false;
    }

    return true;
  },

  /**
   * Extract server-side errors from Ember-Data model
   *
   * @returns {void}
   */
  extractServerErrors: function() {
    var errors = this.get('model.errors');

    // For now, we assume that there are "id" properly set and that they match the attribute name
    errors.forEach(function(item) {
      this.renderServerError(item.attribute, item.message);
    }, this);

    // Force validation of the form
    this.scrollToFirstError();
    this.get('element').checkValidity();
  }.observes('model.errors.[]'),

  /**
   * @param {String} item
   * @param {String|Object} message
   */
  renderServerError: function(item, message) {
    var attribute = Ember.String.dasherize(item),
        messageType = Ember.typeOf(message);

    // If message is itself an object, this means it is a nested error
    if (messageType === 'object') {
      for (var key in message) {
        if (message.hasOwnProperty(key)) {
          this.renderServerError(item + '.' + key, message[key]);
        }
      }
    } else {
      var element = Ember.$.find('#' + attribute.replace(/(:|\.|\[|\]|,)/g, '\\$1'));

      if (element.length > 0) {
        element[0].setCustomValidity(messageType === 'array' ? message[0] : message);
      }
    }
  },

  /**
   * Scroll to the first input field that does not pass the validation
   *
   * @returns {void}
   */
  scrollToFirstError: function() {
    var form = this.get('element');

    // We get the first element that fails, and scroll to it
    for (var i = 0 ; i !== form.elements.length ; ++i) {
      if (!form.elements[i].validity.valid) {
        Ember.$('html, body').animate({
          scrollTop: Ember.$(form.elements[i]).offset().top - 40
        }, 200);

        break;
      }
    }
  }
});
