"use strict";
//-----------------------------------------------------------------------------------
// convert Markdown to HTML
// *** note this requires the inclusion of the CommonMark library (commonmark_min.js)
//-----------------------------------------------------------------------------------
// TODO: 
//-----------------------------------------------------------------------------------
class MarkdownToHTML {
  static convert(str) {
    var reader = new commonmark.Parser();
    var writer = new commonmark.HtmlRenderer();
    var parsed = reader.parse(str);
    var result = writer.render(parsed);

    return result;
  }
}