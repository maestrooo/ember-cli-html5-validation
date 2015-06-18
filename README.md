# Ember CLI HTML5 Validation

This Ember CLI addon provides a simple form validation feature, aligned with the HTML5 spec. It also includes a simple async ``button`` component that aims to be used with forms for better user experience.

## Browser Support

This addon is mostly targeted to simple forms (for now). But more importantly, it's only supported in browsers that support built-in form validation (IE10+, Firefox 4+, Chrome 10+, Safari 5+, Opera 10.1+). For older IE versions, you may use the [H5F polyfill](https://github.com/ryanseddon/H5F).

## Installation

Add the following line to your `package.json`:

```json
"ember-cli-html5-validation": "0.0.*",
```

## Future Work

* Better integration with Ember Data
* Being able to customize more easily templates
* Write unit tests

## Usage

### Basics

This addon automatically adds validation to ``input``, ``radio``, ``checkbox``, and ``textarea`` form controls without any change. If you add the following code:

```html
{{input required=true}}
```

This addon will automatically add an error message when the user focuses out from the field with an empty value, or when the user submits the form. All built-in HTML5 validation rules are supported. For instance:

```html
<!-- Make sure the input is required and is a valid email -->
{{input type="email" value=email required=true}}

<!-- The password is required and must be at least 6 characters long -->
{{input type="password" value=password pattern=".{6,}" required=true}}

<!-- Input length must be 20 maximum -->
{{input value=firstName maxlength=20 required=true}}
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

The browser messages have the advantage of being translated.  Please note, however, that each browser have their own messages, so you must not rely on those if you want the same messages in all browser.

**Note**: if you declare ``title`` attributes on your ``required`` input fields, their respective ``title`` values will be appended to the browser error messages.

#### Custom Error Messages

The easiest way to customize your inputs' error messages is by adding the ``title``.  Adding the ``title`` attribute on your form input controls will cause a message of the ``title``'s value to be shown if validation fail. This is standard on the spec for "pattern" messages, but this addon extends it to any validation. For instance:

```html
<!-- This will show "You must accept agreements" if checkbox is not checked}}
{{input type='checkbox' value=agreements required='required' title='You must accept agreements'}}
```

### Validatable forms

While you can now have built-in validation for inputs, what we want is actually to prevent form submission, automatically scrolling to first field that fails validation.

To do that, you must wrap your inputs around the `validatable-form` component:

```html
{{#validatable-form action="save"}}
  <div class="form-control">
    <label for="first-name">First Name</label>
    {{input id="first-name" title="Please provide a first name" value=firstName required=true autofocus=true}}
  </div>

  <div class="form-control">
    <label for="last-name">Last Name</label>
    {{input id="last-name" title="Please provide a last name" value=lastName required=true}}
  </div>

  <button type="submit" title="Verify account information, and continue to profile setup">Verify and Continue</button>
{{/validatable-form}}
```

When the user submits the form, Ember CLI HTML5 Validation will automatically run validation on each field, showing any input errors and automatically scrolling to the first error.  **Form submission will be prevented if *any* errors are encountered**.

On the other hand, if validation passes, an action will be sent to the action defined in the `validatable-form` component.

### Using with Ember-Data

This addon offers native integration with Ember-Data. To do this, you only need to pass the `model` attribute to the validatable form:

```html
{{#validatable-form action="save" model=model}}
  <div class="form-control">
    <label for="first-name">First Name</label>
    {{input id="first-name" title="Please provide a first name" value=firstName required=true autofocus=true}}
  </div>

  <div class="form-control">
    <label for="last-name">Last Name</label>
    {{input id="last-name" title="Please provide a last name" value=lastName required=true}}
  </div>

  <button type="submit" title="Verify account information, and continue to profile setup">Verify and Continue</button>
{{/validatable-form}}
```

This will:

* Send the ``model`` along with the action (``save`` in this case)
* Extract any *server-side* errors.

When client validation successfully passes, the assigned ``action`` is bubbled up. In case of errors that are returned by server, Ember CLI HTML5 Validation will automatically extract errors (assuming that errors hash is formatted properly) and will show them along corresponding fields.

Server-side errors, in the case of the ``RESTAdapter`` or ``ActiveModelAdapter`` will typically be in the form of a nested ``Array`` in the place of the field:

*Response from server with validation messages*

```json
{
  "user": {
    "firstName": ["First name must be present"],
    "lastName": ["Last name must be present"]
  }
}
```

For more information on ``DS.Errors``, [please refer to the Ember documentation](http://emberjs.com/api/data/classes/DS.Errors.html); a working example [can be found here](http://jsfiddle.net/L96Mb/10/light/).

**Note**: on some Ember-Data adapters, you may need to configure creation of ``DS.InvalidError`` object on failure (this is done out of the box if you are using ActiveModel Adapter). Furthermore, you must add an "id" on each input, that is the dasherized version of the property. For instance, if your server returns the following payload:

**Example of expected error response from ``ActiveModelAdapter``**

```json
{
  "user": {
    "errors": {
        "first_name": [
          "Your First Name is not valid (lol)"
        ]
      }
    }
  }
}
```

In this case, the input must have an ``id`` whose value is "first-name".

> This is currently a bit "hacky" and we want to make this more efficient / allow to work on associations.

### Cookbook

#### Dependent field

If you have an input that is required only if a checkbox is checked, you can do this:

```html
{{input name="first-name" value=firstName required=agreements}}
{{input type="checkbox" name="agreements" checked=agreements}}
```

#### Custom logic

While this library serves mostly to perform quick validations with minimal overhead, HTML5 allows you to provide custom logic and to set custom messages by calling the `setCustomValidity` method on your input. When you call this method, an `invalid` event will be triggered, and the `ValidatableInput` will automatically show it.

### Async Button

Ember-CLI-HTML5-Validation now comes with a minimal ``async`` button. This component can be used for your forms to provide immediate feedback when the form is submitting, and then comes into an ``error`` or ``success`` state. Whenever the form enters into an ``error`` or ``success`` state, this addon will transition the form back to its initial state after 1.5s.

Here are the classes added to the button depending on the status:

* Loading: `is-loading` class is added
* Error: `is-error` class is added
* Success: `is-success` class is added

You can override the default template by setting your own template for the `async-button` component. Here is
an example usage:

```html
{{async-button class="button" value="Sign Up" isLoading=isSaving isValid=isValid}}
```

And with a form:

```html
{{#validatable-form action="save" model=model}}
  <div class="form-control">
    <label for="first-name">First Name</label>
    {{input id="first-name" title="Please provide a first name" value=firstName required=true autofocus=true}}
  </div>

  <div class="form-control">
    <label for="last-name">Last Name</label>
    {{input id="last-name" title="Please provide a last name" value=lastName required=true}}
  </div>

  {{async-button class="button" isLoading=isSaving isValid=isValid}}Sign Up{{/async-button}}
{{/validatable-form}}
```

The `isLoading` and `isValid` properties can either come from computed properties or from your models.

**Note**: the ``async-button`` component will automatically add the ``disabled`` attribute when ``isValid`` is false.
