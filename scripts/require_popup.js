define(function (require) {
  require('popup');
  require('commentbuddy');
  require('fuzzyinputcontrol');
  require('google_webapp_interface');
  require('date_time');
  require('create_element');
  require('clipboard_copy');
  require('standard_notice');

  document.addEventListener('DOMContentLoaded', app.init());
});