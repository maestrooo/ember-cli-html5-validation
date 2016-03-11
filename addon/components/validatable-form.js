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
   * Handle the submit event only if the form is valid
   */
  submit() {
    if (!this.get('element').checkValidity()) {
      return false;
    }

    this.set('isSubmitting', true);

    new Ember.RSVP.Promise((resolve) => {
      resolve(this.get('onSubmit')());
    }).then(() => {
      this.set('isSubmitting', false);
    });

    return false;
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
    }
  }
});
