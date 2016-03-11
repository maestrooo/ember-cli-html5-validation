import Ember from 'ember';

export default Ember.Mixin.create({
  /**
   * @type {Array}
   */
  attributeBindings: ['title', 'data-field'],

  /**
   * Check if the input has already been validated at least once
   *
   * @type {boolean}
   */
  wasValidated: false,

  /**
   * Decide if we show the native browser error messages
   *
   * @type {boolean}
   */
  useBrowserMessages: false,

  /**
   * Current error message for the field
   *
   * @type {string}
   */
  errorMessage: null,

  /**
   * Allow to override error messages
   *
   * @type {Object}
   */
  errorTemplates: {
    // Errors when an input with "required" attribute has no value
    valueMissing: {
      defaultMessage: 'Value is required',
      checkbox: 'You must check this box',
      select: 'You must select at least an option',
      radio: 'You must select an option'
    },

    // Errors when a value does not match a given type like "url" or "email"
    typeMismatch: {
      defaultMessage: 'Value is invalid',
      email: 'Email address is invalid',
      url: 'URL is invalid'
    },

    // Errors when a value does not follow the "pattern" regex
    patternMismatch: {
      defaultMessage: 'Value does not follow expected pattern'
    },

    // Errors when an input is too long
    tooLong: {
      defaultMessage: 'Enter at most %@ characters'
    },

    // Errors when an input is less than "min" value
    rangeUnderflow: {
      defaultMessage: 'Number must be more than %@'
    },

    // Errors when an input is more than "max" value
    rangeOverflow: {
      defaultMessage: 'Number must be less than %@'
    },

    // Errors when a value does not follow step (for instance for "range" type)
    stepMismatch: {
      defaultMessage: 'Value is invalid'
    },

    // Default message that is used when none is matched
    defaultMessage: 'Value is invalid'
  },

  /**
   * @returns {void}
   */
  attachValidationListener: Ember.on('didInsertElement', function() {
    if (this.get('inputTagName') === 'select') {
      this.$().on('invalid.html5-validation change.html5-validation', Ember.run.bind(this, this.validate));
    } else {
      this.$().on('invalid.html5-validation focusout.html5-validation', Ember.run.bind(this, this.validate));
    }
  }),

  /**
   * @returns {void}
   */
  detachValidationListener: Ember.on('willDestroyElement', function() {
    this.$().off('.html5-validation');
  }),

  /**
   * @returns {String}
   */
  inputTagName: Ember.computed(function() {
    return this.get('element').tagName.toLowerCase();
  }),

  /**
   * Validate the input whenever it looses focus
   *
   * @returns {void}
   */
  validate() {
    let input = this.get('element');

    // According to spec, inputs that have "formnovalidate" should bypass any validation
    if (input.hasAttribute('formnovalidate')) {
      return;
    }

    // Textareas do not support "pattern" attribute. As a consequence, if you set a "required" attribute
    // and only add blank spaces or new lines, then it is considered as valid (although it makes little sense).
    if(this.get('inputTagName') === 'textarea' && input.hasAttribute('required')) {
      let content = Ember.$.trim(this.$().val());

      if(content.length === 0) {
        this.$().val('');
      }
    }

    if (!input.validity.valid) {
      this.set('errorMessage', this.getErrorMessage());
    } else {
      this.set('errorMessage', null);
    }

    // We reset the state if we had any custom error, so that they do not "stick" around
    input.setCustomValidity('');

    // If the input was never validated, we attach an additional listener so that validation is
    // run also on keyup. This makes the UX better as it removes error message as you type when
    // you try to fix the errors
    if (!this.get('wasValidated')) {
      this.$().off('focusout.html5-validation').on('keyup.html5-validation', Ember.run.bind(this, this.validate));
      this.set('wasValidated', true);
    }
  },

  /**
   * Notify whenever the error message for that input changes
   *
   * @returns {void}
   */
  notifyError: Ember.observer('errorMessage', function() {
    let fieldName = this.$().data('field') || this.get('elementId');
    this.parentView.send('updateErrorMessage', fieldName, this.get('errorMessage'));
  }),

  /**
   * Get the message error
   *
   * @returns {String}
   */
  getErrorMessage() {
    let target = this.get('element');

    // If user want to use native browser error messages, we directly return. We also return the stored
    // message in case of custom error
    if (this.get('useBrowserMessages') || target.validity.customError) {
      return target.validationMessage;
    }

    let errorTemplates = this.get('errorTemplates'),
      type = target.getAttribute('type');

    // We first check for the "required" case
    if (target.validity.valueMissing) {
      // For checkbox, we allow to have a title attribute that is shown instead of the
      // required message. Very useful for things like "You must accept our terms"
      if (type === 'checkbox' && target.hasAttribute('title')) {
        return target.getAttribute('title');
      }

      return errorTemplates.valueMissing[type] || errorTemplates.valueMissing['defaultMessage'];
    }

    // If a "title" attribute has been set, according to the spec, we can use it as the message
    if (target.hasAttribute('title')) {
      return target.getAttribute('title');
    }

    let errorKeys = ['stepMismatch', 'rangeOverflow', 'rangeUnderflow', 'tooLong', 'patternMismatch', 'typeMismatch'];

    for (let i = 0 ; i !== errorKeys.length ; ++i) {
      let errorKey = errorKeys[i];

      if (!target.validity[errorKey]) {
        continue;
      }

      let message = errorTemplates[errorKey][type] || errorTemplates[errorKey]['defaultMessage'];

      switch (errorKey) {
        case 'tooLong':
          return message.fmt(target.getAttribute('maxlength'));
        case 'rangeUnderflow':
          return message.fmt(target.getAttribute('min'));
        case 'rangeOverflow':
          return message.fmt(target.getAttribute('max'));
        default:
          return message;
      }
    }

    return errorTemplates.defaultMessage;
  }
});
