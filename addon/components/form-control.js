import Ember from 'ember';

export default Ember.Component.extend({
  /**
   * @param {Array}
   */
  classNames: ['form__control'],

  /**
   * @param {Array}
   */
  classNameBindings: ['customErrorClass'],

  /**
   * Error message from the underlying input
   *
   * @param {string}
   */
  error: null,

  /**
   * Class that is added to the wrapper element when there is an error
   *
   * @param {string}
   */
  errorClass: 'form__control--error',

  /**
   * @param {string}
   */
  customErrorClass: Ember.computed('hasError', function() {
    return this.get('hasError') ? this.get('errorClass') : '';
  }),

  /**
   * @param {boolean}
   */
  hasError: Ember.computed.bool('error'),

  actions: {
    /**
     * @param {string} inputName
     * @param {string} errorMessage
     * @returns {boolean}
     */
    updateErrorMessage(inputName, errorMessage) {
      this.set('error', errorMessage);
      this.parentView.send('updateErrorMessage', inputName, errorMessage);
    }
  }
});