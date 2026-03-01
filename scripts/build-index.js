const fs = require('fs');
const path = require('path');

const VALID_SCRIPTS_FILE = path.join(__dirname, 'valid-scripts.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'sources.json');
const SOURCES_DIR = path.join(__dirname, '..', 'sources');

function loadValidScripts() {
  if (!fs.existsSync(VALID_SCRIPTS_FILE)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(VALID_SCRIPTS_FILE, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn(`Failed to parse ${VALID_SCRIPTS_FILE}: ${error.message}`);
    return [];
  }
}

function getScriptFiles() {
  if (!fs.existsSync(SOURCES_DIR)) return [];
  return fs.readdirSync(SOURCES_DIR).filter(file => file.endsWith('.js')).sort((a, b) => a.localeCompare(b, 'zh-Hans-CN'));
}

function getFileMeta(file) {
  const filePath = path.join(SOURCES_DIR, file);
  let size = 0;
  let mtime = '';

  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    size = Math.round((stats.size / 1024) * 100) / 100;
    const date = new Date(stats.mtime);
    mtime = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}:${String(date.getSeconds()).padStart(2, '0')}`;
  }

  return { size, mtime };
}

function main() {
  console.log('=== Build Index ===\n');

  const validScripts = loadValidScripts();
  const validScriptMap = new Map(validScripts.map(item => [item.file, item]));
  const scriptFiles = getScriptFiles();

  console.log(`Found ${scriptFiles.length} source files`);
  console.log(`Found ${validScripts.length} validated scripts\n`);

  const sources = scriptFiles.map(file => {
    const validated = validScriptMap.get(file);
    const { size, mtime } = getFileMeta(file);

    return {
      id: validated?.id || file.replace(/\.js$/i, ''),
      name: file,
      size,
      updateUrl: file,
      updateTime: mtime,
      validated: Boolean(validated),
    };
  });

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ sources }, null, 2));

  console.log(`Written to ${OUTPUT_FILE}`);
  console.log(`Total sources: ${sources.length}`);
  console.log(`Validated sources: ${sources.filter(s => s.validated).length}`);
}

main();
