# Underscore Pure Templates

A secure alternative to Underscore.js templates that completely removes eval and Function constructor usage, replacing it with pure string interpolation.

## Security Features

### 1. Removed eval / new Function
**Explanation**: Traditional _.template compiles template strings into JavaScript code using new Function, which is like eval and can run arbitrary code.

**Fix**: Our version avoids dynamic code execution completely — no runtime compilation, no JavaScript logic.

### 2. Replaced with a Pure String Interpolator
**Explanation**: Instead of evaluating JavaScript, we scan the template string and replace placeholders (<%= name %>) with values from a data object.

**Fix**: No code runs. It's just string replacement, like mail merge — safe and predictable.

### 3. Access Limited to Provided data Only
**Explanation**: The template can only read from the data object you pass. It can't access global variables like window, document, or process — unless you explicitly include them.

**Fix**: This creates a data sandbox — no accidental or malicious access outside the given context.

### 4. Built-in HTML Escaping for <%= %>
**Explanation**: To prevent XSS (cross-site scripting), the engine escapes characters like <, >, & when interpolating.

**Fix**: If a user tries to inject <script>, it shows up as text, not code.

### 5. Trusted Templates Only — No Dynamic Logic
**Explanation**: We don't allow users to define or inject template strings. Only trusted, developer-written templates are used.

**Fix**: Prevents template injection attacks where an attacker could slip in malicious template syntax.

### 6. Sanitization of data Inputs
**Explanation**: Even though templates are safe, we also validate and sanitize input data — removing suspicious keys (like window) or nested references.

**Fix**: Prevents tricking the system into revealing or rendering unexpected content, even indirectly.

### 7. No Access to JavaScript Logic
**Explanation**: Unlike _.template, which allows if, for, function, etc., our approach has no control structures.

**Fix**: Keeps templates logic-free and secure. Data goes in, text comes out — nothing more.

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
