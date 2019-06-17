define(function (require) {
  require('savecomment');
  require('create_element');
  require('markdowntohtml');
  require('standard_notice');
  
  document.addEventListener('DOMContentLoaded', app.init());
});