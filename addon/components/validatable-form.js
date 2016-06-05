import Ember from 'ember';
import layout from '../templates/components/validatable-form';

export default Ember.Component.extend({
  layout,

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
   * @type {Array}
   */
  classNames: ['form'],

  /**
   * List of all error messages, indexed by the input ID
   *
   * @type {Object}
   */
  errors: {},

  /**
   * @type {boolean}
   */
  isSubmitting: false,

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
  },

  actions: {
    /**
     * @param {string} inputName
     * @param {string} errorMessage
     */
    updateErrorMessage(inputName, errorMessage) {
      if (Ember.isNone(errorMessage)) {
        delete this.get('errors')[inputName];
      } else {
        this.get('errors')[inputName] = errorMessage;
      }

      this.rerender();
    },

    /**
     * Handle the submit event only if the form is valid
     */
    submit(eventName) {
      if (!this.get('element').checkValidity()) {
        this.scrollToFirstError();
        return false;
      }

      this.set('isSubmitting', true);

      new Ember.RSVP.Promise((resolve) => {
        resolve(this.get(eventName || 'onSubmit')());
      }).then(() => {
        this.set('isSubmitting', false);
      });

      return false;
    }
  }
});
