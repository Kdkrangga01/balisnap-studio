import fs from 'fs';

// Read detected results
const results = JSON.parse(fs.readFileSync('scripts/detected_results.json', 'utf8'));

// Fix retro-caramel-6 using vintage-retro-6 coordinates as fallback
const vintageRetro6 = results.find(r => r.id === 'vintage-retro-6');
const retroCaramel6 = results.find(r => r.id === 'retro-caramel-6');
if (retroCaramel6 && vintageRetro6) {
  retroCaramel6.slots = 6;
  retroCaramel6.slotCoords = vintageRetro6.slotCoords.map(s => ({ ...s }));
  console.log('Fixed retro-caramel-6 using vintage-retro-6 coordinates.');
}

// Generate TS code
let code = '';
for (const frame of results) {
  code += `,\n  {\n`;
  code += `    id: ${JSON.stringify(frame.id)},\n`;
  code += `    name: ${JSON.stringify(frame.name)},\n`;
  code += `    slots: ${frame.slots},\n`;
  code += `    category: ${JSON.stringify(frame.category)},\n`;
  code += `    src: ${JSON.stringify(frame.src)},\n`;
  code += `    width: ${frame.width}, height: ${frame.height},\n`;
  code += `    slotCoords: [\n`;
  code += frame.slotCoords.map(s => {
    let str = `      { x: ${s.x}, y: ${s.y}, w: ${s.w}, h: ${s.h}`;
    if (s.rx !== undefined) str += `, rx: ${s.rx}`;
    str += ` }`;
    return str;
  }).join(',\n');
  code += `\n    ]\n`;
  code += `  }`;
}

// Read current frames.ts
const filePath = 'src/data/frames.ts';
let content = fs.readFileSync(filePath, 'utf8');

// Insert before the last ];
const lastIndex = content.lastIndexOf('];');
if (lastIndex === -1) {
  console.error('Could not find end of frames array.');
  process.exit(1);
}

const newContent = content.substring(0, lastIndex).trim() + code + '\n];\n';
fs.writeFileSync(filePath, newContent, 'utf8');
console.log('Successfully registered all new templates in src/data/frames.ts!');
