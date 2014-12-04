import Ember from 'ember';
import ValidatableInput from '../mixins/validatable-input';

/**
 * @namespace Ember
 * @class Select
 */
Ember.Select.reopen(ValidatableInput);
