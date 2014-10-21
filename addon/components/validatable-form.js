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
   * @type {boolean}
   */
  novalidate: true,

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
    var form = this.get('element'),
        model = this.get('model');

    if (form.checkValidity() && model.get('isValid') !== false && model.get('isDirty') !== false) {
      this.sendAction('action', model);
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
    if (event.keyCode === 13 && event.target.tagName !== 'textarea') {
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
    var errors = this.get('model.errors'),
        childViews = this.get('childViews');

    // This thing can be pretty inefficient if you have lot of form elements... we need to find
    // a better way!
    errors.forEach(function(item) {
      var attribute = Ember.String.dasherize(item.attribute),
        childViewLength = childViews.get('length');

      for (var i = 0 ; i !== childViewLength ; ++i) {
        if (attribute === childViews[i].get('elementId')) {
          childViews[i].setCustomErrorMessage(item.message);
          break;
        }
      }
    });

    this.scrollToFirstError();
  }.observes('model.errors.length'),

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
