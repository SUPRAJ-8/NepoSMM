const fs = require('fs');
const path = require('path');

const directory = './src';

function walk(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
            let content = fs.readFileSync(fullPath, 'utf8');

            // Check if it contains "use client" OR 'use client' anywhere
            const useClientRegex = /['"]use client['"];?/g;
            if (useClientRegex.test(content)) {
                console.log(`Checking: ${fullPath}`);

                // Remove all occurrences of "use client"
                let newContent = content.replace(useClientRegex, '').trim();

                // Add it back at the very top
                newContent = `"use client";\n\n${newContent}`;

                // Avoid double headers if there was whitespace or comments we accidentally moved
                // (Though .trim() helps)

                if (content.trim() !== newContent.trim()) {
                    fs.writeFileSync(fullPath, newContent);
                    console.log(`  -> Fixed "use client" placement`);
                }
            }
        }
    }
}

walk(directory);
