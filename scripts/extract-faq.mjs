#!/usr/bin/env node
/**
 * Extrait les FAQ des articles markdown et les ajoute au frontmatter.
 * Format dans les articles : **Question?** suivi d'un paragraphe réponse.
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const articlesDir = join(__dirname, '../src/content/articles');

const files = readdirSync(articlesDir).filter(f => f.endsWith('.md'));

for (const file of files) {
  const filePath = join(articlesDir, file);
  const content = readFileSync(filePath, 'utf-8');

  // Split frontmatter
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!fmMatch) { console.log(`Skipping ${file} — no frontmatter`); continue; }

  const [, fm, body] = fmMatch;

  // Already has faq?
  if (fm.includes('faq:')) {
    console.log(`${file} — already has faq, skipping`);
    continue;
  }

  // Find FAQ section
  const faqSectionMatch = body.match(/## Questions fréquentes sur[\s\S]*/);
  if (!faqSectionMatch) {
    console.log(`${file} — no FAQ section found`);
    continue;
  }

  const faqSection = faqSectionMatch[0];

  // Extract **Question?** + following paragraph pairs
  const pairs = [];
  // Match bold question followed by paragraph text
  const qaRegex = /\*\*(.+?)\*\*\n\n([\s\S]+?)(?=\n\n\*\*|\n\n---|\n\n##|$)/g;
  let match;
  while ((match = qaRegex.exec(faqSection)) !== null) {
    const question = match[1].trim();
    const answer = match[2].trim()
      .replace(/\n/g, ' ')
      .replace(/\s+/g, ' ')
      // Remove markdown links
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      // Remove remaining markdown bold/italic
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/\*(.+?)\*/g, '$1');

    if (question && answer) {
      pairs.push({ question, answer });
    }
  }

  if (pairs.length === 0) {
    console.log(`${file} — FAQ section found but no Q&A pairs extracted`);
    continue;
  }

  // Build YAML for faq array
  const faqYaml = pairs.map(p => {
    const q = p.question.replace(/"/g, '\\"');
    const a = p.answer.replace(/"/g, '\\"').substring(0, 500);
    return `  - question: "${q}"\n    answer: "${a}"`;
  }).join('\n');

  const newFm = fm + `\nfaq:\n${faqYaml}`;
  const newContent = `---\n${newFm}\n---\n${body}`;

  writeFileSync(filePath, newContent, 'utf-8');
  console.log(`${file} — added ${pairs.length} FAQ pairs`);
}

console.log('\nDone!');
