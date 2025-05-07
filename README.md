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

## Compatibility

This patch maintains backward compatibility with the original Underscore.js API. Existing code should continue to work, though some complex templates might need to switch to unsafe mode.
