const fs = require('fs');
const path = require('path');

const VALID_SCRIPTS_FILE = path.join(__dirname, 'valid-scripts.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'sources.json');
const SOURCES_DIR = path.join(__dirname, '..', 'sources');

function main() {
    console.log('=== Build Index ===\n');

    // 读取验证通过的脚本列表
    let validScripts = [];
    if (fs.existsSync(VALID_SCRIPTS_FILE)) {
        validScripts = JSON.parse(fs.readFileSync(VALID_SCRIPTS_FILE, 'utf8'));
    }

    console.log(`Found ${validScripts.length} valid scripts\n`);

    // 生成 sources.json
    const sources = validScripts.map(script => {
        const filePath = path.join(SOURCES_DIR, script.file);
        let size = 0;
        let mtime = '';
        
        if (fs.existsSync(filePath)) {
            const stats = fs.statSync(filePath);
            size = Math.round(stats.size / 1024 * 100) / 100; // KB
            const date = new Date(stats.mtime);
            mtime = date.getFullYear() + '-' + 
                    String(date.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(date.getDate()).padStart(2, '0') + ' ' + 
                    String(date.getHours()).padStart(2, '0') + ':' + 
                    String(date.getMinutes()).padStart(2, '0') + ':' + 
                    String(date.getSeconds()).padStart(2, '0');
        }

        return {
            id: script.id,
            name: script.file,
            size: size,
            updateUrl: script.file,
            updateTime: mtime
        };
    });

    const output = {
        sources: sources
    };

    // 写入 sources.json
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));
    console.log(`Written to ${OUTPUT_FILE}`);
    console.log(`Total sources: ${sources.length}`);

    if (sources.length > 0) {
        console.log('\nSources:');
        sources.forEach(s => {
            console.log(`  - ${s.name} (${s.id}) v${s.version}`);
        });
    }
}

main();