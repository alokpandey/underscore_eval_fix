# Underscore.js Template Security Testing

This document describes the comprehensive testing performed to verify the security improvements in our Underscore.js template implementations. It details how we've addressed the removal of unsafe methods and provides an overview of all test cases executed.

## Security Vulnerabilities Addressed

The original Underscore.js template implementation had several critical security vulnerabilities:

1. **Use of `eval`/`Function` constructor**: Allowed arbitrary code execution
2. **No data sandboxing**: Allowed access to global objects and variables
3. **Limited XSS protection**: Didn't automatically escape HTML
4. **Unrestricted JavaScript logic**: Allowed potentially dangerous operations
5. **No input sanitization**: Didn't validate or sanitize template inputs
6. **Access to dangerous properties**: Allowed access to constructors, prototypes, etc.
7. **No isolation**: Template code executed in the global context

## Test Implementations

We've created two secure alternatives to the original Underscore.js templates:

1. **Underscore Fix** (`underscore_fix.js`): A safer implementation with a custom interpreter
2. **Underscore Pure** (`underscore_pure.js`): A pure string interpolation implementation with no code execution

Both implementations have been thoroughly tested to ensure they address all security vulnerabilities.

## Test Cases Overview

### 1. Basic Functionality Tests

These tests verify that the basic template functionality still works correctly:

| Test Case | Description | File | Expected Result |
|-----------|-------------|------|-----------------|
| Basic Interpolation | Simple variable interpolation | `test-template.html`, `test-pure-template.html` | Variable values correctly inserted |
| HTML Escaping | Automatic escaping of HTML characters | `test-template.html`, `test-pure-template.html` | HTML characters properly escaped |
| Nested Property Access | Access to nested object properties | `test-template.html`, `test-pure-template.html` | Nested properties correctly accessed |

### 2. Security Tests

These tests verify that the security vulnerabilities have been addressed:

| Test Case | Description | File | Expected Result |
|-----------|-------------|------|-----------------|
| Eval/Function Removal | Attempt to use eval or Function constructor | `test-template.html`, `test-pure-template.html` | No dynamic code execution |
| Global Object Access | Attempt to access window, document, etc. | `test-template.html`, `test-pure-template.html` | Access blocked |
| Dangerous Property Access | Attempt to access constructor, prototype, etc. | `test-template.html`, `test-pure-template.html` | Access blocked |
| XSS Attack | Attempt to inject script tags | `test-template.html`, `test-pure-template.html` | Script tags escaped |
| Template Injection | Attempt to inject malicious template code | `test-template.html`, `test-pure-template.html` | No code execution |

## Detailed Test Cases

### Test Case 1: Basic Interpolation

**Description**: Tests basic variable interpolation using `<%= name %>` syntax.

**Code**:
```javascript
// Test data
var data = { name: "John" };

// Template
var template = _.template("Hello, <%= name %>!");

// Result
var result = template(data); // Should be "Hello, John!"
```

**Security Aspect**: Verifies that basic functionality works without using eval/Function.

### Test Case 2: HTML Escaping

**Description**: Tests automatic HTML escaping to prevent XSS attacks.

**Code**:
```javascript
// Test data with potentially malicious HTML
var data = { userInput: "<script>alert('XSS')</script>" };

// Template with escaping
var template = _.template("<p><%- userInput %></p>");

// Result
var result = template(data); 
// Should be "<p>&lt;script&gt;alert('XSS')&lt;/script&gt;</p>"
```

**Security Aspect**: Verifies XSS protection through HTML escaping.

### Test Case 3: Nested Property Access

**Description**: Tests access to nested object properties.

**Code**:
```javascript
// Test data with nested objects
var data = {
  user: {
    firstName: "Jane",
    lastName: "Doe"
  }
};

// Template with nested property access
var template = _.template("<p>User: <%= user.firstName %> <%= user.lastName %></p>");

// Result
var result = template(data); // Should be "<p>User: Jane Doe</p>"
```

**Security Aspect**: Verifies that property access is limited to the provided data object.

### Test Case 4: Global Object Access Blocking

**Description**: Tests that access to global objects is blocked.

**Code**:
```javascript
// Template attempting to access global objects
var template = _.template(
  "<p>Window: <%= window %></p>" +
  "<p>Document: <%= document %></p>" +
  "<p>Location: <%= location %></p>"
);

// Result
var result = template({}); 
// Should be "<p>Window: </p><p>Document: </p><p>Location: </p>"
// or show warning messages in console
```

**Security Aspect**: Verifies that access to global objects is blocked.

### Test Case 5: Dangerous Property Access Blocking

**Description**: Tests that access to dangerous properties is blocked.

**Code**:
```javascript
// Template attempting to access dangerous properties
var template = _.template(
  "<p>Constructor: <%= constructor %></p>" +
  "<p>Prototype: <%= __proto__ %></p>" +
  "<p>Function: <%= Function %></p>"
);

// Result
var result = template({});
// Should be "<p>Constructor: </p><p>Prototype: </p><p>Function: </p>"
// or show warning messages in console
```

**Security Aspect**: Verifies that access to dangerous properties is blocked.

### Test Case 6: JavaScript Logic Execution (Underscore Fix)

**Description**: Tests the safe execution of JavaScript logic in the Underscore Fix implementation.

**Code**:
```javascript
// Test data
var data = { items: ["Apple", "Banana", "Orange"] };

// Template with for loop
var template = _.template(
  "<ul>" +
  "<% for(var i=0; i<items.length; i++) { %>" +
  "  <li><%= items[i] %></li>" +
  "<% } %>" +
  "</ul>"
);

// Result
var result = template(data);
// Should be "<ul><li>Apple</li><li>Banana</li><li>Orange</li></ul>"
```

**Security Aspect**: Verifies that JavaScript logic is executed safely without using eval/Function.

### Test Case 7: No JavaScript Logic (Underscore Pure)

**Description**: Tests that JavaScript logic is not executed in the Underscore Pure implementation.

**Code**:
```javascript
// Template with JavaScript logic that should not be executed
var template = _.template(
  "<p>This is just text: <% for(var i=0; i<items.length; i++) { %> loop <% } %></p>"
);

// Result
var result = template({ items: [1, 2, 3] });
// Should be "<p>This is just text:  loop </p>" (logic not executed)
```

**Security Aspect**: Verifies that no JavaScript logic is executed in the pure implementation.

## How Unsafe Methods Were Removed

### 1. Removal of eval/Function Constructor

**Original Code (Unsafe)**:
```javascript
var render = new Function(argument, '_', source);
```

**Underscore Fix (Safe)**:
```javascript
// Custom interpreter that doesn't use eval/Function
function safeEval(code, data, _) {
  // Safe parsing and execution of code
  // ...
}
```

**Underscore Pure (Safest)**:
```javascript
// No eval or Function constructor anywhere
// Pure string interpolation without code execution
```

### 2. Data Sandboxing

**Original Code (Unsafe)**:
```javascript
// No sandboxing - templates can access any variable in scope
```

**Both Implementations (Safe)**:
```javascript
function getPropertySafely(obj, path) {
  // Only allows access to properties in the provided data object
  // Blocks access to dangerous properties
  // ...
}
```

### 3. HTML Escaping

**Original Code (Unsafe)**:
```javascript
// HTML escaping only when using <%- ... %>
```

**Both Implementations (Safe)**:
```javascript
// Comprehensive HTML escaping
var escapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '`': '&#x60;'
};

_.escape = createEscaper(escapeMap);
```

### 4. Input Sanitization

**Original Code (Unsafe)**:
```javascript
// No input sanitization
```

**Both Implementations (Safe)**:
```javascript
// Block access to dangerous properties
var dangerousProps = ['constructor', 'prototype', '__proto__', 'window', 
                      'document', 'global', 'process', 'eval', 'Function'];

// Check for dangerous properties
if (dangerousProps.some(function(prop) { return path.indexOf(prop) >= 0; })) {
  console.warn('Blocked access to potentially dangerous property:', path);
  return '';
}
```

## Test Results

All test cases have been executed successfully, confirming that:

1. **Underscore Fix**:
   - Provides a safe alternative to the original implementation
   - Supports a limited subset of JavaScript logic
   - Blocks access to dangerous properties and global objects
   - Provides strong XSS protection

2. **Underscore Pure**:
   - Provides the most secure implementation
   - Completely eliminates code execution
   - Implements pure string interpolation
   - Provides maximum protection against all types of injection attacks

## Conclusion

Our testing confirms that both implementations successfully address all the security vulnerabilities in the original Underscore.js template implementation. The Underscore Pure implementation provides the highest level of security by completely eliminating code execution, while the Underscore Fix implementation provides a good balance between security and functionality.

To run the tests yourself, open `test-template.html` and `test-pure-template.html` in a browser and check the results.
