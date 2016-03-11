# Ember CLI HTML5 Validation

This Ember CLI addon provides a simple form validation feature, aligned with the HTML5 spec.

## Browser Support

This addon is mostly targeted to simple forms (for now). But more importantly, it's only supported in browsers that support built-in form 
validation (IE10+, Firefox 4+, Chrome 10+, Safari 5+, Opera 10.1+). For older IE versions, you may use the [H5F polyfill](https://github.com/ryanseddon/H5F).

## Installation

Add the following line to your `package.json`:

```json
"ember-cli-html5-validation": "0.1.*",
```

## Future Work

* Better integration with Ember Data
* Write unit tests

## Usage

### Basics

This addon automatically adds validation to ``input``, ``radio``, ``checkbox``, and ``textarea`` form controls without any change. For instance:

```html
{{input required=true}}
```

Contrary to 0.0.* versions of this package, this will no longer render an error by default (it used to render a paragraph, but it didn't give you any
flexibility on how and where to render this error).

Instead, you'll need to wrap an input around a new component called `form-control`:
 
```html
{{#form-control as |error|}}
   <label class="form__label">This is a label</label>
   {{input type='text' class='form__input' required=true}}
   
   {{#if error}}
     <p>{{error}}</p>
   {{/if}}
{{/form-control}}
```

As you can see, the form control component exposes an error, than you can render.

All built-in HTML5 validation rules are supported. For instance:

```html
<!-- Make sure the input is required and is a valid email -->
{{input type="email" value=email required=true}}

<!-- The password is required and must be at least 6 characters long -->
{{input type="password" value=password pattern=".{6,}" required=true}}

<!-- Input length must be 20 maximum -->
{{input value=firstName maxlength=20 required=true}}
```

By default, this addon comes with predefined error messages for each error ([see here](https://github.com/maestrooo/ember-cli-html5-validation/blob/master/addon/mixins/validatable-input.js#L35),
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

The browser messages have the advantage of being translated.  Please note, however, that each browser have their own messages, so you must 
not rely on those if you want the same messages in all browser.

#### Custom Error Messages

The easiest way to customize your inputs' error messages is by adding the ``title``.  Adding the ``title`` attribute on your form input 
controls will cause a message of the ``title``'s value to be shown if validation fail. This is standard on the spec for "pattern" messages, 
but this addon extends it to any validation. For instance:

```html
<!-- This will show "You must accept agreements" if checkbox is not checked}}
{{input type='checkbox' value=agreements required='required' title='You must accept agreements'}}
```

### Validatable forms

In addition of form controls, you should wrap all your forms by a component called `validatable-form`. This component will accumulate all
the error messages from your input (if you want to display them at the form level instead of input level). Also, it comes with a simple
abstraction that allows to know when the form is submitting or not (so you can update your form):

To do that, you must wrap your inputs around the `validatable-form` component:

```html
{{#validatable-form onSubmit=(action 'saveUser') as |component|}}
  {{#each-in component.errors as |field error|}}
    {{field}}: {{error}}
  {{/each-in}}

  {{#form-control}}
    <label class="form__label">Username</label>
    {{input type='text' class='form__input' required=true}}
  {{/form-control}}

  {{#form-control}}
    <label class="form__label">Password</label>
    {{input type='password' class='form__input' required=true}}
  {{/form-control}}
  
  {{#if component.isSubmitting}}
    <p>Currently saving...</p>
  {{/if}}
  
  <input type="submit" value="Submit form">
{{/validatable-form}}
```

When the form is submitted, all the fields will be submitted individually. There are a few things to note:

* We use the block param "component" to access the `isSubmitting` and `errorMessages` properties.
* We specify an action for the `onSubmit` event.
* We use the each-in helper to iterate through each errors.

Note that the `each-in` helper will emit, by default, the EmberJS unique id for the input, and the error message. If you want to override
the ID for something more meaningful, you can add the `data-field` attribute to the input:

```html
{{input type='password' class='form__input' data-field='Password' required=true}}
```

### Using with Ember-Data

Version 0.1.* do not offer any Ember Data integration as of today.

### Cookbook

#### Dependent field

If you have an input that is required only if a checkbox is checked, you can do this:

```html
{{input name="first-name" value=firstName required=agreements}}
{{input type="checkbox" name="agreements" checked=agreements}}
```

#### Custom logic

While this library serves mostly to perform quick validations with minimal overhead, HTML5 allows you to provide custom logic and 
to set custom messages by calling the `setCustomValidity` method on your input. When you call this method, an `invalid` event 
will be triggered, and the `ValidatableInput` will automatically show it.