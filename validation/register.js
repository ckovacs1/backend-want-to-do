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

  return {
    errors,
    isValid: isEmpty(errors),
  };
};

module.exports = validateRegisterInput;
