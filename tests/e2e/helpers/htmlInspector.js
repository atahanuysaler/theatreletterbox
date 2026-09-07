/**
 * HTML, CSS, and Design System Inspector Utility
 * Analyzes static artifacts, templates, and token configurations.
 */

import fs from 'fs';
import path from 'path';

export function readProjectFile(relPath) {
  const fullPath = path.resolve(process.cwd(), relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File not found: ${relPath}`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

export function projectFileExists(relPath) {
  const fullPath = path.resolve(process.cwd(), relPath);
  return fs.existsSync(fullPath);
}

export function getDistAssets() {
  const distDir = path.resolve(process.cwd(), 'dist');
  const assetsDir = path.join(distDir, 'assets');
  if (!fs.existsSync(assetsDir)) {
    return { hasDist: false, files: [] };
  }
  const files = fs.readdirSync(assetsDir).map(file => ({
    name: file,
    path: path.join(assetsDir, file),
    size: fs.statSync(path.join(assetsDir, file)).size,
    isJs: file.endsWith('.js'),
    isCss: file.endsWith('.css')
  }));
  return { hasDist: true, files };
}

// Calculate relative luminance for contrast ratio (WCAG 2.1)
function getLuminance(hex) {
  const cleanHex = hex.replace('#', '');
  const r = parseInt(cleanHex.substring(0, 2), 16) / 255;
  const g = parseInt(cleanHex.substring(2, 4), 16) / 255;
  const b = parseInt(cleanHex.substring(4, 6), 16) / 255;
  const a = [r, g, b].map(v => {
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

export function calculateContrastRatio(hex1, hex2) {
  const l1 = getLuminance(hex1);
  const l2 = getLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
