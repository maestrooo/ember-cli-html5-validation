import Ember from 'ember';
import ValidatableInput from '../mixins/validatable-input';

/**
 * @namespace Ember
 * @class Select
 */
// Ember.Select is removed in v2.0
if (!!Ember.Select){
  Ember.Select.reopen(ValidatableInput);
}
