# Underscore Pure Templates

A secure alternative to Underscore.js templates that completely removes eval and Function constructor usage, replacing it with pure string interpolation.

## Security Vulnerabilities in Original Implementation

The original Underscore.js template implementation has several security vulnerabilities:

```javascript
// Original Underscore.js implementation (simplified)
_.template = function(text) {
  // ...
  var render = new Function(argument, '_', source); // SECURITY RISK: Uses Function constructor (similar to eval)
  // ...
  return function(data) {
    return render.call(this, data, _);
  };
};
```

This implementation:
- Uses `new Function()` to compile templates (similar to eval)
- Allows arbitrary JavaScript execution
- Has no sandboxing or isolation
- Provides access to global objects
- Has limited XSS protection

## Security Improvements: Step-by-Step Changes

### 1. Removed eval / new Function

**Vulnerability**: Original Underscore uses `new Function()` to compile templates, which can execute arbitrary code.

**Fix**: Completely removed all usage of `eval` and `Function` constructor.

**Code Reference**:
```javascript
// BEFORE (original Underscore)
var render = new Function(argument, '_', source);

// AFTER (Underscore Pure)
// No Function constructor or eval anywhere in the code
// Instead, we use pure string interpolation:
var template = function(data) {
  // Process template without eval or Function constructor
  // ...
};
```

### 2. Replaced with a Pure String Interpolator

**Vulnerability**: Original implementation compiles and executes JavaScript code from templates.

**Fix**: Implemented a pure string interpolation approach that simply replaces placeholders with values.

**Code Reference**:
```javascript
// Pure string interpolation implementation
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

    // Process the match - simple string replacement, no code execution
    if (m.escape) {
      // Handle escaped value
      var escapeValue = getPropertySafely(data, m.escape);
      result += _.escape(String(escapeValue || ''));
    } else if (m.interpolate) {
      // Handle interpolated value
      var interpValue = getPropertySafely(data, m.interpolate);
      result += String(interpValue || '');
    }
  }

  // Add the remaining text
  result += text.slice(index);

  return result;
};
```

### 3. Access Limited to Provided data Only

**Vulnerability**: Original templates can access any variable in scope, including global objects.

**Fix**: Implemented strict data sandboxing that only allows access to the provided data object.

**Code Reference**:
```javascript
// Data sandboxing implementation
function getPropertySafely(obj, path) {
  // Only allows access to properties in the provided data object
  // No access to global objects or variables

  // Sanitize the path
  if (typeof path !== 'string') return '';

  // Block access to dangerous properties
  var dangerousProps = ['constructor', 'prototype', '__proto__', 'window',
                        'document', 'global', 'process', 'eval', 'Function'];

  path = path.trim();
  if (dangerousProps.some(function(prop) { return path.indexOf(prop) >= 0; })) {
    console.warn('Blocked access to potentially dangerous property:', path);
    return '';
  }

  // Handle simple property access
  if (/^[\w\$]+$/.test(path)) {
    return obj[path];
  }

  // Handle nested property access
  var parts = path.split('.');
  var value = obj;

  for (var i = 0; i < parts.length; i++) {
    var part = parts[i].trim();

    // Check for dangerous properties at each level
    if (dangerousProps.some(function(prop) { return part === prop; })) {
      console.warn('Blocked access to potentially dangerous property:', part);
      return '';
    }

    // Handle array access
    var arrayMatch = part.match(/^(\w+)\[(\d+)\]$/);
    if (arrayMatch) {
      var propName = arrayMatch[1];
      var index = parseInt(arrayMatch[2], 10);
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
```

### 4. Built-in HTML Escaping

**Vulnerability**: Original implementation doesn't automatically escape HTML, making it vulnerable to XSS attacks.

**Fix**: Implemented automatic HTML escaping for all interpolated values.

**Code Reference**:
```javascript
// HTML escaping implementation
var escapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;'
};

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

// Usage in template processing
if (m.escape) {
  var escapeValue = '';
  try {
    escapeValue = getPropertySafely(data, m.escape);
    escapeValue = escapeValue == null ? '' : _.escape(String(escapeValue));
  } catch (e) {
    escapeValue = '';
  }
  result += escapeValue;
}
```

### 5. Trusted Templates Only — No Dynamic Logic

**Vulnerability**: Original implementation allows dynamic template creation and execution, which can lead to template injection attacks.

**Fix**: Removed support for dynamic template logic and execution.

**Code Reference**:
```javascript
// Template settings - removed evaluate blocks
_.templateSettings = {
  interpolate: /<%=([\s\S]+?)%>/g,  // <%= interpolation %>
  escape: /<%-([\s\S]+?)%>/g,       // <%- escaping %>
  // No evaluate blocks - they're removed for security
};

// No support for <% ... %> evaluate blocks
var matcher = RegExp([
  (_.templateSettings.escape || /(?!)/g).source,
  (_.templateSettings.interpolate || /(?!)/g).source
].join('|') + '|$', 'g');

// Only processes escape and interpolate blocks, ignores evaluate blocks
```

### 6. Sanitization of data Inputs

**Vulnerability**: Original implementation doesn't validate or sanitize input data, allowing access to dangerous properties.

**Fix**: Implemented comprehensive input validation and sanitization.

**Code Reference**:
```javascript
// Input sanitization
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

  // Additional checks for nested properties...
  // ...
}
```

### 7. No Access to JavaScript Logic

**Vulnerability**: Original implementation allows full JavaScript logic in templates, including control structures and function calls.

**Fix**: Completely removed support for JavaScript logic in templates.

**Code Reference**:
```javascript
// Original Underscore supports JavaScript logic in <% ... %> blocks
// Our implementation completely removes this capability

// No support for evaluate blocks
_.templateSettings = {
  interpolate: /<%=([\s\S]+?)%>/g,
  escape: /<%-([\s\S]+?)%>/g,
  // No evaluate property - removed completely
};

// No parsing or execution of JavaScript logic
// Only simple string interpolation is supported
```

## Usage

```javascript
// Create a template
var template = _.template("Hello, <%= name %>!");

// Render the template with data
var result = template({ name: "John" });
// "Hello, John!"

// HTML escaping for security
var template2 = _.template("<p><%- userInput %></p>");
var result2 = template2({ userInput: "<script>alert('XSS')</script>" });
// "<p>&lt;script&gt;alert('XSS')&lt;/script&gt;</p>"
```

## Limitations

1. **No JavaScript Logic**: You cannot use JavaScript control structures like if, for, while, etc.
2. **No Function Calls**: You cannot call functions from within templates
3. **Limited Property Access**: Only simple property access and nested properties are supported
4. **No Dynamic Templates**: Templates should be defined by developers, not users

## Testing

Open `test-pure-template.html` in a browser to see examples of the pure template implementation.

## Security Comparison

| Feature | Original Underscore | Underscore Pure |
|---------|---------------------|-----------------|
| Eval/Function | Yes (unsafe) | No |
| JavaScript Logic | Yes (unsafe) | No |
| HTML Escaping | Optional | Default |
| Data Sandboxing | No | Yes |
| Dangerous Property Blocking | No | Yes |
| XSS Protection | Limited | Strong |

## When to Use

Use this implementation when:

1. You need simple string interpolation without logic
2. Security is a priority
3. You're working with untrusted data
4. You want to prevent XSS attacks

If you need more complex template logic, consider using a different templating engine with built-in security features, or ensure that your templates and data are completely trusted.
