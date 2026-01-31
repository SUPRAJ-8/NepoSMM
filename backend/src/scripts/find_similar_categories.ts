
import { query } from '../config/db';
import * as fs from 'fs';

async function findSimilarCategories() {
    let output = '';
    const log = (msg: string) => {
        console.log(msg);
        output += msg + '\n';
    };

    try {
        const res = await query('SELECT DISTINCT display_category FROM services WHERE display_category IS NOT NULL');
        const cats = res.rows.map(r => r.display_category);

        log(`Analyzing ${cats.length} unique categories...`);

        for (let i = 0; i < cats.length; i++) {
            for (let j = i + 1; j < cats.length; j++) {
                const c1 = cats[i];
                const c2 = cats[j];

                // Simple checks:
                // 1. Case insensitive match
                if (c1.toLowerCase() === c2.toLowerCase()) {
                    log(`Case-insensitive match: "${c1}" and "${c2}"`);
                    continue;
                }

                // 2. Trailing/leading whitespace
                if (c1.trim() === c2.trim()) {
                    log(`Whitespace match: "${c1}" and "${c2}"`);
                    continue;
                }

                // 3. Substring with small diff (e.g. one has 'f' at end)
                if (c1.length > 5 && c2.length > 5) {
                    if (c1.startsWith(c2) && c1.length === c2.length + 1) {
                        log(`Extension match: "${c1}" is "${c2}" plus "${c1.slice(-1)}"`);
                    } else if (c2.startsWith(c1) && c2.length === c1.length + 1) {
                        log(`Extension match: "${c2}" is "${c1}" plus "${c2.slice(-1)}"`);
                    }
                }
            }
        }

    } catch (err) {
        log('Error: ' + err);
    } finally {
        fs.writeFileSync('similar_categories.txt', output);
        process.exit();
    }
}

findSimilarCategories();
