import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const SRC_DIR = path.resolve('src');
const VERSE_REGISTRY_PATH = path.resolve('src/lib/surya-siddhanta/data/verses.json');

/**
 * Maps the human-readable [Ch. VIII, v.2-6] citation to our registry's dot-notation.
 */
function normalizeCitation(roman, verse) {
  if (!roman) return '';
  const firstVerse = (verse || '1').split(/[\-\s,]/)[0].trim();
  return `${roman.toUpperCase()}.${firstVerse}`;
}

async function resolveSiddhantaDocs() {
  console.log('--- Starting Siddhantic Scriptural Resolution ---');

  if (!fs.existsSync(VERSE_REGISTRY_PATH)) {
    console.error('Master Verse Registry not found!');
    process.exit(1);
  }
  const registry = JSON.parse(fs.readFileSync(VERSE_REGISTRY_PATH, 'utf-8'));

  const files = execSync(`find ${SRC_DIR} -name "*.ts"`).toString().split('\n').filter(Boolean);
  const originalContents = new Map();

  try {
    console.log(`--- Injecting Siddhantic Proofs into ${files.length} modules ---`);
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      originalContents.set(file, content);

      const lines = content.split('\n');
      let hasChanges = false;
      const citationRegex = /\[Ch\.\s+([IVXLCDM]+)(?:,\s+v\.?\s*([\d\-\s,]+))?\]/gi;

      const processedLines = lines.map(line => {
        const matches = [...line.matchAll(citationRegex)];
        if (matches.length === 0) return line;

        // Detect prefix: supports JSDoc ' * ' or single-line ' // '
        const prefixMatch = line.match(/^(\s*(?:\/\/| \* | \*)) /);
        const prefix = prefixMatch ? prefixMatch[1] : null;

        // Safety: If no clear comment prefix is found, skip injection to avoid corrupting code
        if (!prefix) return line;

        let newLineContent = line;
        for (const match of matches) {
          const key = normalizeCitation(match[1], match[2]);
          if (registry[key]) {
            hasChanges = true;
            const entry = registry[key];

            // Build the injected block using the detected prefix
            let injection = `\n${prefix}\n${prefix} <details class="siddhantic-proof">\n${prefix} <summary>Siddhantic Proof: ${entry.adhyaya} v.${key.split('.')[1]}</summary>\n${prefix}\n${prefix} **Sanskrit (Devanagari):**\n${prefix}\n${prefix} ${entry.sanskrit}\n${prefix}\n${prefix} **Translation (Burgess):**\n${prefix}\n${prefix} ${entry.translation}\n${prefix}`;

            if (entry.modernCommentary) {
              injection += `\n${prefix} **Modern Technical Commentary:**\n${prefix}\n${prefix} ${entry.modernCommentary}\n${prefix}`;
            }

            injection += `\n${prefix} </details>\n${prefix}`;

            // Insert the injection after the citation match
            newLineContent = newLineContent.replace(match[0], `${match[0]}${injection}`);
          }
        }
        return newLineContent;
      });

      if (hasChanges) {
        fs.writeFileSync(file, processedLines.join('\n'));
      }
    }

    console.log('--- Running TypeDoc Enrichment ---');
    execSync('npx typedoc --skipErrorChecking', { stdio: 'inherit' });

    console.log('--- Injecting Header Theme Toggle and footer ---');
    const toggleScript = fs.readFileSync(path.resolve('scripts/header-toggle.js'), 'utf-8');
    const docsDir = path.resolve('docs/api');
    const htmlFiles = execSync(`find ${docsDir} -name "*.html"`).toString().split('\n').filter(Boolean);

    for (const htmlFile of htmlFiles) {
      let html = fs.readFileSync(htmlFile, 'utf-8');

      // Inject Header Toggle
      if (html.includes('</body>') && !html.includes('id="header-theme-toggle"')) {
        const injectedScript = `\n<script>\n${toggleScript}\n</script>\n</body>`;
        html = html.replace('</body>', injectedScript);
      }
      // Inject Footer
      if (html.includes('<footer></footer>')) {
        const footerContent = `<footer><div class="container container-main"><p><b>Siddhanta Parity API</b> | Author: <i>khumnath cg</i></p></div></footer>`;
        html = html.replace('<footer></footer>', footerContent);
      }

      fs.writeFileSync(htmlFile, html);
    }

  } catch (error) {
    console.error('Build Error:', error.message);
  } finally {
    console.log('--- Restoring Original Clean Source Files ---');
    for (const [file, content] of originalContents) {
      fs.writeFileSync(file, content);
    }
  }
}

resolveSiddhantaDocs().catch(console.error);
