const fs = require('fs');
const path = require('path');

function resolveFilePath(filePath, baseDir, projectRoot) {
  // Normalize the file path to handle different OS path separators
  const normalizedPath = path.normalize(filePath);
  
  // Handle project-relative absolute paths (starting with /) FIRST
  // This takes precedence over system path detection
  if (filePath.startsWith('/')) {
    // Project-relative absolute path - remove leading slash and resolve from project root
    const relativePath = normalizedPath.slice(1);
    return path.resolve(projectRoot, relativePath);
  }
  
  // Handle system absolute paths (C:\, D:\, /home/, etc.)
  if (path.isAbsolute(normalizedPath)) {
    // System absolute path - use as-is
    return normalizedPath;
  }
  
  // Relative path - resolve from baseDir
  return path.resolve(baseDir, normalizedPath);
}

function inlineComponentTags(html, baseDir, projectRoot, visited = new Set()) {
  return html.replace(/\[([\/]?[\w/.\-\s]+\.comp)\]/g, (match, filePathRaw) => {
    const filePath = filePathRaw.trim();
    const fullPath = resolveFilePath(filePath, baseDir, projectRoot);

    if (!fs.existsSync(fullPath)) {
      return `<!-- Missing component: ${filePath} (resolved to: ${fullPath}) -->`;
    }

    if (visited.has(fullPath)) {
      return `<!-- Circular reference prevented: ${filePath} -->`;
    }

    visited.add(fullPath);
    let content = fs.readFileSync(fullPath, 'utf-8');
    
    // Process the component content:
    // - For component tags: use componentDir for relative paths, projectRoot for absolute paths
    // - For scripts/images: use componentDir as baseDir so relative paths work correctly
    const componentDir = path.dirname(fullPath);
    
    // Process nested components first (they might contain scripts/images)
    content = inlineComponentTags(content, componentDir, projectRoot, visited);
    // Then process scripts and images relative to this component's directory
    content = inlineScripts(content, componentDir, projectRoot);
    content = inlineImages(content, componentDir, projectRoot);
    
    visited.delete(fullPath);
    return content;
  });
}

function inlineScripts(html, baseDir, projectRoot) {
  return html.replace(/<script\s+src="(.+?)"><\/script>/g, (match, srcRaw) => {
    const src = srcRaw.trim();
    const fullPath = resolveFilePath(src, baseDir, projectRoot);

    if (!fs.existsSync(fullPath)) {
      return `<!-- Missing script: ${src} -->`;
    }
    
    const content = fs.readFileSync(fullPath, 'utf-8');
    return `<script>\n${content}\n</script>`;
  });
}

function inlineImages(html, baseDir, projectRoot) {
  return html.replace(/<img\s+[^>]*src="([^"]+\.(png|jpe?g|gif|svg))"[^>]*>/gi, (match, srcRaw) => {
    const src = srcRaw.trim();
    
    // Skip external URLs (http/https)
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return match;
    }
    
    // Skip data URLs
    if (src.startsWith('data:')) {
      return match;
    }
    
    const fullPath = resolveFilePath(src, baseDir, projectRoot);
    
    if (!fs.existsSync(fullPath)) {
      return `<!-- Missing image: ${src} -->`;
    }

    const ext = path.extname(src).slice(1).toLowerCase();
    const mime = ext === 'svg' ? 'image/svg+xml' : `image/${ext}`;
    const data = fs.readFileSync(fullPath).toString('base64');
    const dataUrl = `data:${mime};base64,${data}`;

    return match.replace(srcRaw, dataUrl);
  });
}

function compileHybridHTML(inputFile, outputFile) {
  // Resolve the input file to get its absolute path
  const inputFilePath = path.resolve(inputFile);
  const inputDir = path.dirname(inputFilePath);
  
  // Use the input file's directory as the project root for resolving absolute paths
  // This ensures that paths starting with '/' are resolved relative to where the main HTML file is located
  const projectRoot = inputDir;
  const baseDir = inputDir;

  let html = fs.readFileSync(inputFilePath, 'utf-8');

  // Process in the correct order: components first, then their dependencies
  html = inlineComponentTags(html, baseDir, projectRoot);
  // Note: scripts and images are now processed inside inlineComponentTags for each component
  // But we still need to process any remaining scripts/images in the main HTML
  html = inlineScripts(html, baseDir, projectRoot);
  html = inlineImages(html, baseDir, projectRoot);

  fs.writeFileSync(outputFile, html, 'utf-8');
  console.log(`✅ Compiled to: ${outputFile}`);
  console.log(`📁 Project root used: ${projectRoot}`);
}

module.exports = {
  compileHybridHTML,
  inlineComponentTags,
  inlineScripts,
  inlineImages,
  resolveFilePath
};