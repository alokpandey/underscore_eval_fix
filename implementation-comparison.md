# Underscore.js Template Security Implementations Comparison

This document compares the two different approaches to securing Underscore.js templates:

1. **Underscore Fix** (`underscore_fix.js`): A safer implementation that uses a custom interpreter
2. **Underscore Pure** (`underscore_pure.js`): A pure string interpolation implementation with no code execution

## Security Approach Comparison

| Feature | Original Underscore | Underscore Fix | Underscore Pure |
|---------|---------------------|----------------|-----------------|
| **Eval/Function Usage** | Uses `new Function()` | No direct eval, but custom interpreter | No eval or code execution |
| **JavaScript Logic** | Full JavaScript | Limited safe subset | No JavaScript logic |
| **Control Structures** | All (if, for, while, etc.) | Limited (if, for) | None |
| **Function Calls** | Any function | Limited safe functions | No function calls |
| **HTML Escaping** | Optional | Optional | Default |
| **Data Sandboxing** | No | Yes | Yes |
| **Dangerous Property Blocking** | No | Limited | Comprehensive |
| **XSS Protection** | Limited | Improved | Strong |
| **Template Complexity** | High | Medium | Low |
| **Performance** | Fast (compiled) | Medium | Fast (simple) |

## Underscore Fix (underscore_fix.js)

### Approach
- Implements a custom JavaScript interpreter for evaluate blocks
- Parses and executes a safe subset of JavaScript
- Maintains backward compatibility with original templates
- Provides a toggle between safe and unsafe modes

### Pros
- Supports common JavaScript operations (loops, conditionals)
- More powerful templates with logic
- Compatible with existing Underscore templates
- Safer than the original implementation

### Cons
- More complex implementation
- Still allows some code execution (though in a sandbox)
- Not as secure as pure string interpolation

### Use Case
- When you need template logic but want improved security
- When migrating from existing Underscore templates
- When you need backward compatibility

## Underscore Pure (underscore_pure.js)

### Approach
- Pure string interpolation with no code execution
- Completely removes evaluate blocks
- Strict data sandboxing and property access controls
- Comprehensive blocking of dangerous properties

### Pros
- Maximum security - no code execution at all
- Simple implementation
- Fast performance
- Strong XSS protection
- Complete data sandboxing

### Cons
- No template logic (if, for, etc.)
- Limited functionality compared to full templates
- Not backward compatible with templates that use logic

### Use Case
- When security is the absolute priority
- When working with untrusted data
- When simple string interpolation is sufficient
- When you want to prevent XSS attacks

## Security Features in Underscore Pure

1. **No eval or Function constructor**
   - No dynamic code execution
   - No runtime compilation
   - No JavaScript logic

2. **Pure String Interpolation**
   - Simple string replacement
   - No code execution
   - Predictable output

3. **Strict Data Sandboxing**
   - Access limited to provided data object
   - No access to global objects
   - No access to dangerous properties

4. **HTML Escaping by Default**
   - Automatic escaping of HTML characters
   - Protection against XSS attacks
   - Safe rendering of user input

5. **Dangerous Property Blocking**
   - Blocks access to constructor, prototype, __proto__
   - Blocks access to window, document, global
   - Prevents prototype pollution attacks

6. **No JavaScript Logic**
   - No control structures (if, for, while)
   - No function calls
   - Data goes in, text comes out - nothing more

## Recommendation

For maximum security, especially when working with untrusted data or in security-sensitive applications, use the **Underscore Pure** implementation. It completely eliminates the risk of code execution and provides the strongest protection against XSS and other injection attacks.

If you need more template functionality and are working with trusted data, the **Underscore Fix** implementation provides a good balance between security and functionality.

Never use the original Underscore template implementation with untrusted data or in security-sensitive applications.
