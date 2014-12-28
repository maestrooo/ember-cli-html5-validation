# Ember CLI HTML5 Validation

This Ember CLI addon aims to provide a simple form validation feature. It also includes a simple async button that
is aims to be used with forms for better user experience.

## Major limitations

This addon is mostly targeted to simple forms (for now). But more importantly, it's only supported in browsers
that support built-in form validation (IE10+, Firefox 4+, Chrome 10+, Safari 5+, Opera 10.1+). For older IE versions,
you may use the [H5F polyfill](https://github.com/ryanseddon/H5F).

## Installation

Add the following line to your `package.json`:

```json
"ember-cli-html5-validation": "0.0.*",
```

## Future work

* Better integration with Ember Data
* Being able to customize more easily templates
* Write unit tests

## Usage

### Basics

This addon automatically adds validation feature to input, radio, checkbox and text areas, without any change. If
you add the following code:

```html
{{input required='required'}}
```

It will automatically adds an error message if you focus out from the field with an empty value, or when you submit
the form. All built-in HTML5 validation rules are supported. For instance:

```html
<!-- Make sure the input is required and is a valid email -->
{{input type='email' value=email required='required'}}

<!-- The password is required and must be at least 6 characters long -->
{{input type='password' value=password pattern='.{6,}' required='required'}}

<!-- Input length must be 20 maximum -->
{{input value=firstName maxlength=20}}
```

By default, this addon comes with predefined error messages for each error ([see here](https://github.com/maestrooo/ember-cli-html5-validation/blob/master/addon/mixins/validatable-input.js#L33),
but you can override them by reopening the mixin:

```js
import ValidatableInput from 'ember-cli-html5-validation/mixins/validatable-input';

ValidatableInput.reopen({
  errorTemplates: {
    valueMissing: {
      defaultMessage: "Don't leave me blank!!!"
    }
  }
});
```

You can also decide to use native browser messages instead:

```js
import ValidatableInput from 'ember-cli-html5-validation/mixins/validatable-input';

ValidatableInput.reopen({
  useBrowserMessages: true
});
```

The browser messages have the advantage of being translated, please note however that each browser have their
own messages, so you must not rely on those if you want the same messages in all browser.

#### Custom messages

You can use the "title" attribute on form to define a message that will be shown if validation fail. This is standard
on the spec for "pattern" messages, but I decided to extend it to any validation. For instance:

```html
<!-- This will show "You must accept agreements" if checkbox is not checked}}
{{input type='checkbox' value=agreements required='required' title='You must accept agreements'}}
```

### Validatable forms

While you can now have built-in validation for inputs, what we want is actually being able to prevent form submission,
automatically scrolling to first field that fail...

To do that, you must wrap your inputs around the `validatable-form` component:

```html
{{#validatable-form action='save'}}
  <div class="form-control">
    {{input name='first-name' value=firstName required='required'}}
  </div>

  <div class="form-control">
    {{input name='last-name' value=lastName required='required'}}
  </div>

  <input type="submit"}}
{{/validatable-form}}
```

If you submit the form, Ember CLI HTML5 Validation will automatically run validation on each field, showing the
input error, and automatically scrolling to the first error. If error happen, no form submission will happen.

On the other hand, if validation passes, an action will be sent to the action defined in the `validatable-form`
component.

### Using with Ember-Data

This addon offers native integration with Ember-Data. To do this, you only need to pass the `model` attribute to
the validatable form:

```html
{{#validatable-form action='save' model=model}}
  <div class="form-control">
    {{input name='first-name' value=firstName required='required'}}
  </div>

  <div class="form-control">
    {{input name='last-name' value=lastName required='required'}}
  </div>

  <input type="submit"}}
{{/validatable-form}}
```

This will provide two things:

* The model will be send along the action.
* It also extracts server-side errors.

When client validation successfully passes, the action is submitted. In case of errors that are returned by server,
Ember CLI HTML5 Validation will automatically extracts errors (assuming that errors hash is formatted properly) and
will show them along corresponding fields.

> This is currently a bit hacky and I want to make this more efficient / allow to work on associations.

### Cookbook

#### Dependent field

If you have an input that is required only if a checkbox is checked, you can do that:

```html
{{input name='first-name' value=firstName required=agreements}}
{{input type='checkbox' name='agreements' checked=agreements}}
```

#### Custom logic

While this library is mostly aims to perform quick validations with minimal overhead, HTML5 allows you to provide
custom logic and set custom message by calling the `setCustomValidity` method on your input. When you call this method,
an `invalid` event will be triggered and the `ValidatableInput` will automatically show it.

### Async Button

Ember-CLI-HTML5-Validation now comes with a minimal async button. This component can be used for your forms to provide
immediate feedback when the form is submitting, and then comes into an error or success state. Whenever it enters into
error or success state, it will transition back to initial state after 1.5s.

Here are the classes added to the button depending on the status:

* Loading: `is-loading` class is added
* Error: `is-error` class is added
* Success: `is-success` class is added

You can override the default template by setting your own template for the `async-button` component. Here is
an example usage:

```html
{{async-button class='button' value='Sign Up' isLoading=isSaving isValid=isValid}}
```

`isLoading` and `isValid` property can comes either from computed properties or your models.