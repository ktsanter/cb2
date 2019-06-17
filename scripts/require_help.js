define(function (require) {
  require('help');
  require('create_element');
  require('markdowntohtml');
  
  document.addEventListener('DOMContentLoaded', app.init());
});