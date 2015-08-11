import Ember from 'ember';

export default Ember.Component.extend({
  /**
   * @type {string}
   */
  tagName: 'button',

  /**
   * @type {Array}
   */
  classNameBindings: [':async-button', 'isLoading:is-loading', 'hasErrorClass:is-error', 'hasSuccessClass:is-success'],

  /**
   * @type {Array}
   */
  attributeBindings: ['disabled', 'type'],

  /**
   * @type {boolean}
   */
  disabled: Ember.computed.not('isDefault'),

  /**
   * @type {string}
   */
  type: 'submit',

  /**
   * Is the button in its default state?
   *
   * @type {boolean}
   */
  isDefault: true,

  /**
   * Is the button currently loading?
   *
   * @type {boolean}
   */
  isLoading: false,

  /**
   * Is the button in a valid state?
   *
   * @type {boolean}
   */
  isValid: false,

  /**
   * @returns {Boolean}
   */
  hasErrorClass: function() {
    return !this.get('isDefault') && !this.get('isValid');
  }.property('isDefault', 'isValid').readOnly(),

  /**
   * @returns {Boolean}
   */
  hasSuccessClass: function() {
    return !this.get('isDefault') && this.get('isValid');
  }.property('isDefault', 'isValid').readOnly(),

  /**
   * Set isDefault to false when isLoading is triggered to disable the button.
   * When the isLoading goes back to "false", we check if the button is in an error state. If that's
   * the case, we enforce the error state, otherwise we switch to "valid"
   */
  observesLoading: function() {
    if (this.get('isLoading')) {
      this.set('isDefault', false);
    } else {
      Ember.run.later(this, function() {
        /**
         * Check to make sure set is not called after the component is already destroyed.
         * This generates an error that causes acceptance tests to fail and is unnecessary.
        */
        if (!this.get('isDestroyed')) {
          this.set('isDefault', true);
        }
      }, 1500);
    }
  }.observes('isLoading')
});
