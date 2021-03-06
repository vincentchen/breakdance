'use strict';

var util = require('snapdragon-util');
var extend = require('extend-shallow');

module.exports = function(options) {
  return function(node, nodes, i) {
    var opts = extend({}, this.options, options);
    var replaceRe = /(?:lang(uage)?|highlight|source|brush:\s*)[-]?| /g;
    var testRe = /(?:lang(uage)?|highlight|source|brush:\s*)/;

    var code = opts.literalPre;
    if (!code && !util.hasType(node, 'code')) {
      code = true;
    }

    if (code) {
      node.lang = (node.attr && node.attr['data-lang']) || '';
      var attribs = node.attribs;

      if (!node.lang && attribs && attribs.class) {
        var cls = attribs.class;
        if (cls && testRe.test(cls)) {
          node.lang = cls.replace(replaceRe, '');
        }
      }

      var parent = node.parent || {};
      if (!node.lang && parent && parent.attribs) {
        cls = parent.attribs.class;
        if (cls && testRe.test(cls)) {
          node.lang = cls.replace(replaceRe, '');
        }
      }

      if (!node.lang && /<[^>]+>/.test(node.text)) {
        return this.emit(node.outer, node);
      }

      this.emit('\n\n```', node);
      this.emit(node.lang);
      this.emit(code ? node.html : node.text, node);
      this.emit('```\n\n', node);

    } else if (/<pre\s*[^>]*><(?!code)[^>]+>/.test(node.outer)) {
      this.emit(node.outer, node);

    } else if (node.nodes) {
      this.mapVisit(node);
    }
  };
};

