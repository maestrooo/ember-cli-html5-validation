import Ember from 'ember';
import ValidatableInputMixin from 'ember-cli-html5-validation/mixins/validatable-input';
import { module, test } from 'qunit';

module('Unit | Mixin | validatable input');

// Replace this with your real tests.
test('it works', function(assert) {
  let ValidatableInputObject = Ember.Object.extend(ValidatableInputMixin);
  let subject = ValidatableInputObject.create();
  assert.ok(subject);
});
