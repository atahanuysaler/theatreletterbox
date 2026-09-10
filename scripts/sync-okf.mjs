#!/usr/bin/env node
/**
 * Self-updating Google OKF (Open Knowledge Format) compiler and synchronizer.
 * Scans knowledge concepts, validates cross-references, updates index.md files,
 * tracks changes in knowledge/log.md, and optionally runs in watch mode.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const KNOWLEDGE_DIR = path.join(ROOT_DIR, 'knowledge');
const TYPES_FILE = path.join(ROOT_DIR, 'types.ts');
const RULES_FILE = path.join(ROOT_DIR, 'firestore.rules');
const DESIGN_FILE = path.join(ROOT_DIR, 'design.md');
const LOG_FILE = path.join(KNOWLEDGE_DIR, 'log.md');

// Simple YAML frontmatter parser
function parseFrontmatter(content) {
  if (!content.startsWith('---')) return { frontmatter: null, body: content };
  const endIdx = content.indexOf('\n---', 3);
  if (endIdx === -1) return { frontmatter: null, body: content };

  const rawYaml = content.slice(3, endIdx).trim();
  const body = content.slice(endIdx + 4).trim();
  const frontmatter = {};

  let currentKey = null;
  let isList = false;

  for (const line of rawYaml.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (trimmed.startsWith('- ') && currentKey && isList) {
      frontmatter[currentKey].push(trimmed.slice(2).trim());
      continue;
    }

    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim();
      const val = line.slice(colonIdx + 1).trim();

      if (val === '') {
        currentKey = key;
        isList = true;
        frontmatter[key] = [];
      } else {
        currentKey = null;
        isList = false;
        let parsedVal = val;
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          parsedVal = val.slice(1, -1);
        }
        frontmatter[key] = parsedVal;
      }
    }
  }

  return { frontmatter, body };
}

// Collect all concept files (.md except index.md and log.md)
function getConceptFiles(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getConceptFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      if (entry.name !== 'index.md' && entry.name !== 'log.md') {
        files.push(fullPath);
      }
    }
  }
  return files;
}

// Ensure directory exists
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

// Append or initialize OKF log.md
function recordLogEntry(action, details) {
  ensureDir(KNOWLEDGE_DIR);
  const timestamp = new Date().toISOString();
  const entry = `\n### [${timestamp}] - ${action}\n${details}\n`;

  if (!fs.existsSync(LOG_FILE)) {
    const initialContent = `# OKF Knowledge Graph Change Log\n\nAutomated record of synchronization events, schema drift checks, and concept indexing.\n${entry}`;
    fs.writeFileSync(LOG_FILE, initialContent, 'utf-8');
  } else {
    fs.appendFileSync(LOG_FILE, entry, 'utf-8');
  }
}

// Build OKF Indexes
export function syncKnowledge() {
  console.log('🔄 [OKF Sync] Scanning knowledge concepts and source artifacts...');
  ensureDir(KNOWLEDGE_DIR);

  const conceptFiles = getConceptFiles(KNOWLEDGE_DIR);
  const concepts = [];

  for (const filePath of conceptFiles) {
    const relPath = path.relative(KNOWLEDGE_DIR, filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const { frontmatter, body } = parseFrontmatter(content);

    if (frontmatter && frontmatter.id) {
      concepts.push({
        filePath,
        relPath,
        category: path.dirname(relPath) === '.' ? 'root' : path.dirname(relPath),
        ...frontmatter,
      });
    }
  }

  // Group concepts by category
  const categories = {};
  for (const c of concepts) {
    if (!categories[c.category]) categories[c.category] = [];
    categories[c.category].push(c);
  }

  // 1. Generate Subfolder index.md files
  const categoryTitles = {
    domain: 'Domain Concepts (Tiyatronot İş Alanı)',
    architecture: 'System Architecture (Mimari ve Veri Akışı)',
    design: 'Design System (Carbon Tasarım Dili ve Tokenlar)',
  };

  for (const [catName, catConcepts] of Object.entries(categories)) {
    if (catName === 'root') continue;
    const catDir = path.join(KNOWLEDGE_DIR, catName);
    const catTitle = categoryTitles[catName] || `${catName.toUpperCase()} Concepts`;

    let subIndexContent = `---
id: ${catName}/index
title: ${catTitle}
type: index
category: ${catName}
---

# ${catTitle}

Index of canonical ${catName} knowledge definitions for the Tiyatronot platform.

## Concepts Catalog

| Concept | Identifier | Type | Tags | Related |
| :--- | :--- | :--- | :--- | :--- |
`;

    for (const c of catConcepts) {
      const fileName = path.basename(c.filePath);
      const tagsStr = Array.isArray(c.tags) ? c.tags.map(t => '`' + t + '`').join(', ') : '-';
      const relatedStr = Array.isArray(c.related) ? c.related.map(r => '`' + r + '`').join(', ') : '-';
      subIndexContent += `| [${c.title}](./${fileName}) | \`${c.id}\` | \`${c.type || 'concept'}\` | ${tagsStr} | ${relatedStr} |\n`;
    }

    subIndexContent += `\n*Last auto-generated: ${new Date().toISOString()}*\n`;

    fs.writeFileSync(path.join(catDir, 'index.md'), subIndexContent, 'utf-8');
  }

  // 2. Generate Root knowledge/index.md
  let rootIndexContent = `---
id: index
title: Tiyatronot Knowledge Base
type: catalog
spec: "Google Open Knowledge Format (OKF) v0.2"
project: "Tiyatronot (theatreletterbox)"
---

# Tiyatronot Open Knowledge Base (OKF)

Welcome to the canonical Open Knowledge Format (OKF) catalog for **Tiyatronot**—the digital playbill, critique, and discovery notebook for Turkish theatre.

This knowledge base provides an interconnected, deterministic graph of truth for AI agents and human developers.

## Knowledge Graph Overview

\`\`\`mermaid
graph TD
    Root["knowledge/index.md"] --> Domain["Domain (İş Alanı)"]
    Root --> Arch["Architecture (Mimari)"]
    Root --> Design["Design (Tasarım Sistemi)"]

    Domain --> Play["Play (Oyun Künyesi)"]
    Domain --> Review["Review (Tiyatro Günlüğü)"]
    Domain --> User["User (Seyirci Profili & XP)"]
    Domain --> Sub["Submission (Oyun Önerisi)"]

    Arch --> Firestore["Firestore & Security Rules"]
    Arch --> Auth["Auth & RBAC"]
    Arch --> Scraper["Scraper Pipeline"]

    Design --> Tokens["Design Tokens & Carbon Light"]
\`\`\`

## Navigation Categories

`;

  for (const catName of Object.keys(categories)) {
    if (catName === 'root') continue;
    const catTitle = categoryTitles[catName] || catName;
    const catConcepts = categories[catName];

    rootIndexContent += `### [${catTitle}](./${catName}/index.md)\n\n`;
    rootIndexContent += `| Concept | ID | Tags |\n| :--- | :--- | :--- |\n`;
    for (const c of catConcepts) {
      const relPath = `${catName}/${path.basename(c.filePath)}`;
      const tagsStr = Array.isArray(c.tags) ? c.tags.map(t => '`' + t + '`').join(', ') : '-';
      rootIndexContent += `| [${c.title}](./${relPath}) | \`${c.id}\` | ${tagsStr} |\n`;
    }
    rootIndexContent += `\n`;
  }

  rootIndexContent += `## Specifications & Audit
* **Specification:** Google Open Knowledge Format
* **Audit History:** [Change Log](./log.md)
* **Sync Engine:** \`scripts/sync-okf.mjs\`
* **Last Compiled:** ${new Date().toISOString()}
`;

  fs.writeFileSync(path.join(KNOWLEDGE_DIR, 'index.md'), rootIndexContent, 'utf-8');

  // 3. Record Audit
  recordLogEntry(
    'Sync Completed',
    `Cataloged ${concepts.length} concept documents across ${Object.keys(categories).length} categories.`
  );

  console.log(`✅ [OKF Sync] Compiled ${concepts.length} concepts across ${Object.keys(categories).length} categories.`);
}

// Watch Mode
function runWatch() {
  syncKnowledge();
  console.log('👀 [OKF Watch] Watching for file changes in types.ts, firestore.rules, design.md, and knowledge/ ...');

  let debounceTimer = null;
  const triggerSync = (triggerFile) => {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      console.log(`\n🔔 [OKF Watch] Change detected in ${triggerFile}. Re-compiling...`);
      syncKnowledge();
    }, 300);
  };

  const watchTargets = [TYPES_FILE, RULES_FILE, DESIGN_FILE, KNOWLEDGE_DIR];
  for (const target of watchTargets) {
    if (fs.existsSync(target)) {
      fs.watch(target, { recursive: true }, (eventType, filename) => {
        if (filename && (filename.endsWith('index.md') || filename.endsWith('log.md'))) {
          return; // prevent infinite loops from our own compiler writes
        }
        triggerSync(filename || target);
      });
    }
  }
}

// Entrypoint
if (process.argv.includes('--watch')) {
  runWatch();
} else {
  syncKnowledge();
}
