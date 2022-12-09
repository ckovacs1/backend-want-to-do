const Validator = require('validator');
const isEmpty = require('is-empty');

const validateRegisterInput = data => {
  let errors = {};

  data.name.first = !isEmpty(data.name.first) ? data.name.first : '';
  data.name.last = !isEmpty(data.name.last) ? data.name.last : '';
  data.email = !isEmpty(data.email) ? data.email : '';
  data.password = !isEmpty(data.password) ? data.password : '';
  data.password2 = !isEmpty(data.password2) ? data.password2 : '';

  if (Validator.isEmpty(data.name.first)) {
    errors.first = 'First Name field is required';
  }

  if (Validator.isEmpty(data.name.last)) {
    errors.last = 'Last Name field is required';
  }

  if (Validator.isEmpty(data.email)) {
    errors.email = 'Email field is required';
  } else if (!Validator.isEmail(data.email)) {
    errors.email = 'Email field is invalid';
  }

  if (Validator.isEmpty(data.password)) {
    errors.password = 'Password field is required';
  }

  if (Validator.isEmpty(data.password2)) {
    errors.password2 = 'Confirm password field is required';
  }

  if (!Validator.isLength(data.password, { min: 6, max: 30 })) {
    errors.password = 'Password must be at least 6 characters';
  }
  if (!Validator.equals(data.password, data.password2)) {
    errors.password2 = 'Passwords must match';
  }

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

module.exports = validateRegisterInput;
