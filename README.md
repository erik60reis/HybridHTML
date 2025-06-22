# Hybrid HTML Compiler

A powerful compiler for Hybrid HTML that inlines components, scripts, and images into a single HTML file.

## Features

- 📦 **Component Inlining**: Include reusable HTML components with `[component.comp]` syntax
- 🔗 **Script Inlining**: Automatically inline JavaScript files referenced in `<script src="">` tags
- 🖼️ **Image Inlining**: Convert images to base64 data URLs for self-contained HTML files
- 🔄 **Recursive Processing**: Supports nested components with proper path resolution
- 🛡️ **Circular Reference Protection**: Prevents infinite loops in component dependencies
- 🌐 **Cross-Platform**: Works on Windows, macOS, and Linux

## Installation

### Global Installation (Recommended)
```bash
npm install -g hybrid-html-compiler
```

### Local Installation
```bash
npm install hybrid-html-compiler
```

## Usage

### Command Line Interface

```bash
# Compile a hybrid HTML file
hybrid compile input.hybrid.html output.html

# Example
hybrid compile example/index.hybrid.html dist.html
```

### Programmatic Usage

```javascript
const { compileHybridHTML } = require('hybrid-html-compiler');

compileHybridHTML('input.hybrid.html', 'output.html');
```

## Syntax

### Components
Create reusable HTML components with `.comp` extension:

**header.comp**
```html
<header>
  <h1>My Website</h1>
  <nav>[navigation.comp]</nav>
</header>
```

**Include in your HTML:**
```html
<!DOCTYPE html>
<html>
<head>
  <title>My Site</title>
</head>
<body>
  [header.comp]
  <main>Content here</main>
</body>
</html>
```

### Path Resolution

- **Relative paths**: `[components/header.comp]` - resolved relative to current file
- **Absolute paths**: `[/shared/header.comp]` - resolved relative to project root
- **Scripts and images**: Follow the same path resolution rules

### Script Inlining

Scripts referenced with `<script src="">` are automatically inlined:

```html
<script src="./js/app.js"></script>
<!-- Becomes: -->
<script>
// Contents of app.js
</script>
```

### Image Inlining

Images are converted to base64 data URLs:

```html
<img src="./images/logo.png" alt="Logo">
<!-- Becomes: -->
<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..." alt="Logo">
```

## Project Structure Example

```
my-project/
├── index.hybrid.html
├── components/
│   ├── header.comp
│   ├── footer.comp
│   └── navigation.comp
├── scripts/
│   └── app.js
└── images/
    └── logo.png
```

## CLI Options

```bash
hybrid --help                    # Show help
hybrid --version                 # Show version
hybrid compile <input> <output>  # Compile hybrid HTML
```

## Error Handling

The compiler provides helpful error messages:

- Missing components show as HTML comments: `<!-- Missing component: header.comp -->`
- Circular references are prevented: `<!-- Circular reference prevented: header.comp -->`
- Missing scripts/images are noted: `<!-- Missing script: app.js -->`

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request