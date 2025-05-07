# Underscore.js Eval Security Changes

This document shows the changes made to Underscore.js (saved as `underscore_fix.js`) to replace unsafe eval usage with safer alternatives.

## Change 1: Global Context Detection

### Before:

```javascript
// Establish the root object, `window` (`self`) in the browser, `global`
// on the server, or `this` in some virtual machines. We use `self`
// instead of `window` for `WebWorker` support.
var root = (typeof self == 'object' && self.self === self && self) ||
          (typeof global == 'object' && global.global === global && global) ||
          Function('return this')() ||
          {};
```

### After:

```javascript
// Establish the root object, `window` (`self`) in the browser, `global`
// on the server, or `this` in some virtual machines. We use `self`
// instead of `window` for `WebWorker` support.
var root = (typeof self == 'object' && self.self === self && self) ||
          (typeof global == 'object' && global.global === global && global) ||
          // Safer alternative to Function('return this')()
          (typeof this == 'object' ? this : {});
```

## Change 2: Template Settings

### Before:

```javascript
// By default, Underscore uses ERB-style template delimiters. Change the
// following template settings to use alternative delimiters.
var templateSettings = _$1.templateSettings = {
  evaluate: /<%([\s\S]+?)%>/g,
  interpolate: /<%=([\s\S]+?)%>/g,
  escape: /<%-([\s\S]+?)%>/g
};
```

### After:

```javascript
// By default, Underscore uses ERB-style template delimiters. Change the
// following template settings to use alternative delimiters.
var templateSettings = _$1.templateSettings = {
  evaluate: /<%([\s\S]+?)%>/g,
  interpolate: /<%=([\s\S]+?)%>/g,
  escape: /<%-([\s\S]+?)%>/g,
  // Set to false to use the original unsafe template implementation
  // Set to true (default) to use the safe implementation without eval
  safe: true
};
```

## Change 3: Template Function

### Before:

The original template function used `new Function()` to dynamically create a function from a string of code:

```javascript
var render;
try {
  render = new Function(argument, '_', source);
} catch (e) {
  e.source = source;
  throw e;
}
```

### After:

The new implementation provides two options:

1. **Safe Mode (Default)**: A completely rewritten template function that doesn't use eval or Function constructor
2. **Unsafe Mode (Optional)**: The original implementation for backward compatibility

The safe implementation:
- Processes templates without using eval or Function constructor
- Supports basic interpolation and escaping
- Includes a secure mini-interpreter for evaluate blocks
- Supports common JavaScript operations like loops, conditionals, and basic expressions
- Executes code in a sandboxed environment

## Security Considerations

1. **Global Context Detection**:
   - The original code used `Function('return this')()` which is similar to eval
   - The new code uses object detection which is safer

2. **Template Function**:
   - The original code used `new Function()` which executes arbitrary code
   - The new code provides a safe alternative that doesn't execute arbitrary code
   - The safe mode is enabled by default but can be disabled for backward compatibility

## Usage

### Safe Mode (Default)

```javascript
// Safe mode is enabled by default
var compiled = _.template("Hello, <%= name %>!");
compiled({ name: "John" }); // "Hello, John!"
```

### Unsafe Mode (Optional)

```javascript
// Disable safe mode if you need full template functionality
// WARNING: Only use with trusted template strings!
_.templateSettings.safe = false;

var compiled = _.template("<% print('Hello, ' + name + '!'); %>");
compiled({ name: "John" }); // "Hello, John!"
```

## Summary

These changes make Underscore.js more secure by default while maintaining backward compatibility for users who need the original functionality. The safe mode provides protection against code injection attacks while still supporting most common template use cases.
