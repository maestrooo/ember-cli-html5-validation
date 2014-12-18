import Ember from 'ember';

export default Ember.Component.extend({
  /**
   * @type {string}
   */
  tagName: 'button',

  /**
   * @type {Array}
   */
  classNameBindings: [':async-button', 'isLoading', 'isErrorOneWay:is-error', 'isSuccess'],

  /**
   * @type {Array}
   */
  attributeBindings: ['disabled', 'type'],

  /**
   * @type {boolean}
   */
  disabled: Ember.computed.any('isLoading', 'isErrorOneWay', 'isSuccess'),

  /**
   * @type {string}
   */
  type: 'submit',

  /**
   * Is the button currently loading?
   *
   * @type {boolean}
   */
  isLoading: false,

  /**
   * Is the button in an error state?
   *
   * @type {boolean}
   */
  isError: false,

  /**
   * @type {boolean}
   */
  isErrorOneWay: Ember.computed.oneWay('isError'),

  /**
   * Is the button in a valid state?
   *
   * @type {boolean}
   */
  isSuccess: false,

  /**
   * When the button enters into "error" state, we introduce a small timer of 1.5 second, and then
   * get back to original state
   */
  observesError: function() {
    if (this.get('isErrorOneWay')) {
      Ember.run.later(this, function() {
        this.set('isErrorOneWay', false);
      }, 1500);
    }
  }.observes('isErrorOneWay'),

  /**
   * When the isLoading goes back to "false", we check if the button is in an error state. If that's
   * the case, we enforce the error state, otherwise we switch to "valid"
   */
  observesLoading: function() {
    if (!this.get('isLoading')) {
      if (this.get('isError')) {
        this.set('isErrorOneWay', true);
      } else {
        this.set('isSuccess', true);

        Ember.run.later(this, function() {
          this.set('isSuccess', false);
        }, 1500);
      }
    }
  }.observes('isLoading')
});
