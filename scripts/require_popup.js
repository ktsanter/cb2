define(function (require) {
  require('popup');
  require('commentbuddy');
  require('google_webapp_interface');
  require('create_element');
  require('clipboard_copy');
  require('standard_notice');
  require('markdowntohtml');
  require('chromesyncstorage');
  
  document.addEventListener('DOMContentLoaded', app.init());
});