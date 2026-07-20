const fs = require('fs');
const fc = fs.readFileSync('scripts/generate_assets.cjs', 'utf8');
const ft = fs.readFileSync('src/data/frames.ts', 'utf8');

// Match all ids
const fcIds = Array.from(fc.matchAll(/id:\s*["']([^"']+)["']/g)).map(m => m[1]);
const ftIds = Array.from(ft.matchAll(/id:\s*["']([^"']+)["']/g)).map(m => m[1]);

console.log('Total in generate_assets.cjs:', fcIds.length);
console.log('Total in frames.ts:', ftIds.length);
console.log('Not in generate_assets:', ftIds.filter(id => !fcIds.includes(id)));
console.log('Not in frames.ts:', fcIds.filter(id => !ftIds.includes(id)));

