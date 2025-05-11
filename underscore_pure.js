/**
 * Underscore.js Pure Template Implementation
 * 
 * A secure alternative to Underscore.js templates that completely removes
 * eval and Function constructor usage, replacing it with pure string interpolation.
 */

(function() {
  // Create a safe reference to the Underscore object
  var _ = {};

  // Current version
  _.VERSION = '1.0.0';

  // Template settings
  _.templateSettings = {
    interpolate: /<%=([\s\S]+?)%>/g,  // <%= interpolation %>
    escape: /<%-([\s\S]+?)%>/g,       // <%- escaping %>
    // No evaluate blocks - they're removed for security
  };

  /**
   * HTML escaping for XSS protection
   */
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };

  // Functions for escaping and unescaping strings to/from HTML
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    var source = '(?:' + Object.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  
  _.escape = createEscaper(escapeMap);

  /**
   * Safe property access - only allows access to properties in the provided data object
   * No access to global objects, prototypes, or dangerous properties
   */
  function getPropertySafely(obj, path) {
    // Sanitize the path to prevent accessing dangerous properties
    if (typeof path !== 'string') return '';
    
    // Block access to dangerous properties
    var dangerousProps = ['constructor', 'prototype', '__proto__', 'window', 
                          'document', 'global', 'process', 'eval', 'Function'];
    
    // Simple property access
    path = path.trim();
    if (dangerousProps.some(function(prop) { return path.indexOf(prop) >= 0; })) {
      console.warn('Blocked access to potentially dangerous property:', path);
      return '';
    }
    
    // Handle simple property access
    if (/^[\w\$]+$/.test(path)) {
      return obj[path];
    }
    
    // Handle nested property access (obj.prop.subprop)
    var parts = path.split('.');
    var value = obj;
    
    for (var i = 0; i < parts.length; i++) {
      var part = parts[i].trim();
      
      // Check for dangerous properties at each level
      if (dangerousProps.some(function(prop) { return part === prop; })) {
        console.warn('Blocked access to potentially dangerous property:', part);
        return '';
      }
      
      // Handle array access like obj.prop[0]
      var arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
      if (arrayMatch) {
        var propName = arrayMatch[1];
        var index = parseInt(arrayMatch[2], 10);
        
        // Check for dangerous properties
        if (dangerousProps.some(function(prop) { return propName === prop; })) {
          console.warn('Blocked access to potentially dangerous property:', propName);
          return '';
        }
        
        value = value[propName];
        if (value == null) return '';
        value = value[index];
      } else {
        value = value[part];
      }
      
      if (value == null) return '';
    }
    
    return value;
  }

  /**
   * Pure template function - no eval, no Function constructor, no JavaScript logic
   * Just simple string interpolation with HTML escaping
   */
  _.template = function(text) {
    // Combine delimiters into one regular expression via alternation
    var matcher = RegExp([
      (_.templateSettings.escape || /(?!)/g).source,
      (_.templateSettings.interpolate || /(?!)/g).source
    ].join('|') + '|$', 'g');

    // This is our pure template renderer function
    var template = function(data) {
      if (!data) data = {};
      var result = '';
      var matches = [];
      var index = 0;
      
      // First pass: collect all matches and their positions
      text.replace(matcher, function(match, escape, interpolate, offset) {
        matches.push({
          match: match,
          escape: escape,
          interpolate: interpolate,
          offset: offset,
          length: match.length
        });
        return match;
      });
      
      // Second pass: process the template
      for (var i = 0; i < matches.length; i++) {
        var m = matches[i];
        // Add text before the match
        result += text.slice(index, m.offset);
        index = m.offset + m.length;
        
        // Process the match
        if (m.escape) {
          var escapeValue = '';
          try {
            // Safely access nested properties
            escapeValue = getPropertySafely(data, m.escape);
            escapeValue = escapeValue == null ? '' : _.escape(String(escapeValue));
          } catch (e) {
            escapeValue = '';
            console.error('Template error in escape expression:', m.escape, e);
          }
          result += escapeValue;
        } else if (m.interpolate) {
          var interpValue = '';
          try {
            // Safely access nested properties
            interpValue = getPropertySafely(data, m.interpolate);
            interpValue = interpValue == null ? '' : String(interpValue);
          } catch (e) {
            interpValue = '';
            console.error('Template error in interpolate expression:', m.interpolate, e);
          }
          result += interpValue;
        }
      }
      
      // Add the remaining text
      if (index < text.length) {
        result += text.slice(index);
      }
      
      return result;
    };
    
    return template;
  };

  // Export the Underscore object
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    window._ = _;
  }
})();
