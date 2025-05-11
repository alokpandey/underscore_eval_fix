# Underscore.js Security Patch

This is a patched version of Underscore.js (renamed to `underscore_fix.js`) that addresses security concerns related to the use of `eval` and `Function` constructor in the original library.

## Changes Made

1. **Global Context Detection**: Replaced `Function('return this')()` with a safer alternative that doesn't use the Function constructor.

2. **Template Function**: Added a safe mode for the template function that doesn't use `new Function()` to execute arbitrary code.
   - The safe implementation processes templates without using eval or Function constructor
   - It supports basic interpolation and escaping
   - It includes a secure mini-interpreter for evaluate blocks
   - Supports common JavaScript operations like loops, conditionals, and basic expressions

3. **Configuration Option**: Added a `safe` option to `_.templateSettings` to control whether to use the safe implementation (default: true) or the original implementation.

## Usage

### Basic Usage (Safe Mode)

```javascript
// Safe mode is enabled by default
var compiled = _.template("Hello, <%= name %>!");
compiled({ name: "John" }); // "Hello, John!"
```

### Disabling Safe Mode

```javascript
// Disable safe mode if you need full template functionality
// WARNING: Only use with trusted template strings!
_.templateSettings.safe = false;

var compiled = _.template("<% print('Hello, ' + name + '!'); %>");
compiled({ name: "John" }); // "Hello, John!"
```

### Testing

Open `test-template.html` in a browser to see examples of both safe and unsafe template modes.

## Security Considerations

1. **Safe Mode Features**:
   - Executes code in a sandboxed environment
   - Supports common template operations without using eval
   - Implements a secure mini-interpreter for JavaScript expressions
   - Supports loops, conditionals, variable assignments, and basic operations
   - Prevents access to dangerous functions and properties

2. **Safe Mode Limitations**:
   - Some complex JavaScript expressions may not be supported
   - Limited support for object methods and prototype chain
   - Not all JavaScript language features are available

3. **When to Use Unsafe Mode**:
   - Only use unsafe mode with trusted template strings
   - Never use unsafe mode with templates that include user input
   - Use unsafe mode only when you need advanced JavaScript features not supported in safe mode

## Backward Compatibility

This patch maintains backward compatibility with the original Underscore.js API while significantly improving security. However, existing code that relies heavily on JavaScript logic in templates may require some adjustments. Here are several approaches to handle backward compatibility:

### 1. Dual-Mode Implementation (Simplest Approach)

Our implementation includes a configuration option to switch between safe and unsafe modes:

```javascript
// Default: Safe mode
var safeTemplate = _.template("<%= name %>");

// For templates that require eval functionality
_.templateSettings.safe = false;
var complexTemplate = _.template("<% for(var i=0; i<items.length; i++) { %><li><%= items[i] %></li><% } %>");

// Reset to safe mode for other templates
_.templateSettings.safe = true;
```

This approach allows you to:
- Use the safe implementation by default
- Selectively opt out for specific templates that require the original functionality
- Gradually migrate your codebase to safer patterns

### 2. Pre-compilation Strategy (Production Environments)

For production environments, consider pre-compiling templates during the build process:

```javascript
// During build process (development environment)
var fs = require('fs');
var _ = require('underscore'); // Original Underscore

// Pre-compile templates
var templates = {
  userList: _.template(fs.readFileSync('templates/user-list.html', 'utf8')),
  userProfile: _.template(fs.readFileSync('templates/user-profile.html', 'utf8'))
};

// Save compiled templates
fs.writeFileSync('dist/compiled-templates.js',
  'window.templates = ' + JSON.stringify({
    userList: templates.userList.source,
    userProfile: templates.userProfile.source
  })
);

// In production code
// Load pre-compiled templates and use them safely
var userListTemplate = new Function('obj', '_', templates.userList);
function renderUserList(users) {
  return userListTemplate(users, _);
}
```

This approach:
- Keeps the security benefits in production
- Maintains full template functionality
- Moves the security risk to build time (controlled environment)

### 3. Template Refactoring (Most Secure)

For critical applications where security is paramount:

```javascript
// BEFORE: Logic in template
var oldTemplate = _.template(
  "<ul>" +
  "<% for(var i=0; i<items.length; i++) { %>" +
  "  <li class='<%= i % 2 === 0 ? \"even\" : \"odd\" %>'><%= items[i] %></li>" +
  "<% } %>" +
  "</ul>"
);

// AFTER: Logic in JavaScript, only interpolation in template
var newTemplate = _.template("<ul><%= itemsList %></ul>");

function renderItems(items) {
  var itemsHtml = items.map(function(item, i) {
    var className = i % 2 === 0 ? "even" : "odd";
    return "<li class='" + className + "'>" + _.escape(item) + "</li>";
  }).join("");

  return newTemplate({itemsList: itemsHtml});
}
```

This approach:
- Completely eliminates the security risk
- Separates logic from presentation
- Works with the pure implementation

### 4. Hybrid Approach (Recommended)

Combine multiple strategies based on the security requirements of different parts of your application:

```javascript
// Configuration
var securityLevel = process.env.NODE_ENV === 'production' ? 'high' : 'medium';

// Template rendering factory
function createTemplateRenderer(templateString, securityRequirement) {
  // For templates with minimal security requirements
  if (securityRequirement === 'low' && securityLevel !== 'high') {
    _.templateSettings.safe = false;
    var template = _.template(templateString);
    _.templateSettings.safe = true;
    return function(data) { return template(data); };
  }

  // For templates with medium security requirements
  if (securityRequirement === 'medium' && securityLevel !== 'high') {
    // Use safe mode with custom interpreter
    return _.template(templateString);
  }

  // For templates with high security requirements or production
  // Use pure string interpolation or pre-compiled templates
  return createSecureRenderer(templateString);
}

// Usage
var userListRenderer = createTemplateRenderer(userListTemplate, 'high');
var adminPanelRenderer = createTemplateRenderer(adminPanelTemplate, 'low');
```

This approach:
- Applies different security levels based on context
- Balances security and functionality
- Provides a clear migration path

### Migration Guide

1. **Identify Templates Using JavaScript Logic**
   ```javascript
   // Look for templates with <% ... %> blocks
   var templatesWithLogic = _.template("<% if (condition) { %> ... <% } %>");
   ```

2. **Categorize by Complexity and Security Requirements**
   - Simple logic: Can use the safe interpreter
   - Complex logic: May need unsafe mode or refactoring
   - Security-critical: Should be refactored to remove logic

3. **Apply the Appropriate Strategy for Each Template**
   - Low risk, complex logic: Use unsafe mode
   - Medium risk: Use safe interpreter
   - High risk: Refactor to remove logic

4. **Test Thoroughly**
   - Verify functionality with the safe implementation
   - Check for security improvements
   - Ensure backward compatibility
