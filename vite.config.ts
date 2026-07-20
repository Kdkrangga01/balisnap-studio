import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'save-frame-middleware',
      configureServer(server) {
        server.middlewares.use(async (req, res, next) => {
          if (req.url === '/api/save-frame' && req.method === 'POST') {
            try {
              // Parse the body
              const body = await new Promise<string>((resolve, reject) => {
                let data = '';
                req.on('data', chunk => data += chunk);
                req.on('end', () => resolve(data));
                req.on('error', err => reject(err));
              });
              
              const payload = JSON.parse(body);
              const { id, name, slots, category, src, width, height, slotCoords } = payload;
              
              // 1. Decode base64 PNG and save it
              const base64Data = src.replace(/^data:image\/png;base64,/, "");
              const templatesDir = path.resolve(__dirname, 'public/templates');
              const fileName = `${id}.png`;
              const filePath = path.join(templatesDir, fileName);
              
              fs.writeFileSync(filePath, base64Data, 'base64');
              console.log(`Saved new frame file: ${filePath}`);
              
              // 2. Append new frame configuration to src/data/frames.ts
              const framesFile = path.resolve(__dirname, 'src/data/frames.ts');
              let content = fs.readFileSync(framesFile, 'utf8');
              
              // Formulate the new typescript frame object
              let newFrameCode = `,\n  {\n`;
              newFrameCode += `    id: ${JSON.stringify(id)},\n`;
              newFrameCode += `    name: ${JSON.stringify(name)},\n`;
              newFrameCode += `    slots: ${slots},\n`;
              newFrameCode += `    category: ${JSON.stringify(category)},\n`;
              newFrameCode += `    src: ${JSON.stringify(`/templates/${fileName}`)},\n`;
              newFrameCode += `    width: ${width}, height: ${height},\n`;
              newFrameCode += `    slotCoords: [\n`;
              newFrameCode += slotCoords.map((s: any) => {
                let str = `      { x: ${s.x}, y: ${s.y}, w: ${s.w}, h: ${s.h}`;
                if (s.rx !== undefined) str += `, rx: ${s.rx}`;
                str += ` }`;
                return str;
              }).join(',\n');
              newFrameCode += `\n    ]\n`;
              newFrameCode += `  }`;
              
              const lastIndex = content.lastIndexOf('];');
              if (lastIndex !== -1) {
                const newContent = content.substring(0, lastIndex).trim() + newFrameCode + '\n];\n';
                fs.writeFileSync(framesFile, newContent, 'utf8');
                console.log(`Successfully registered frame ${id} in src/data/frames.ts`);
              }
              
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true }));
            } catch (err: any) {
              console.error('Failed to save custom frame:', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          } else if (req.url === '/api/delete-frame' && req.method === 'POST') {
            try {
              const body = await new Promise<string>((resolve, reject) => {
                let data = '';
                req.on('data', chunk => data += chunk);
                req.on('end', () => resolve(data));
                req.on('error', err => reject(err));
              });
              
              const payload = JSON.parse(body);
              const { id } = payload;
              if (!id) throw new Error('ID is required');

              // 1. Delete image file if it exists
              const templatesDir = path.resolve(__dirname, 'public/templates');
              const fileName = `${id}.png`;
              const filePath = path.join(templatesDir, fileName);
              if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`Deleted custom frame file: ${filePath}`);
              }

              // 2. Remove configuration from src/data/frames.ts
              const framesFile = path.resolve(__dirname, 'src/data/frames.ts');
              if (fs.existsSync(framesFile)) {
                let content = fs.readFileSync(framesFile, 'utf8');
                const idSearch = `id: ${JSON.stringify(id)}`;
                const idIndex = content.indexOf(idSearch);
                if (idIndex !== -1) {
                  const startIndex = content.lastIndexOf('{', idIndex);
                  let endIndex = -1;
                  let braceCount = 0;
                  for (let i = startIndex; i < content.length; i++) {
                    if (content[i] === '{') braceCount++;
                    if (content[i] === '}') {
                      braceCount--;
                      if (braceCount === 0) {
                        endIndex = i + 1;
                        break;
                      }
                    }
                  }
                  if (startIndex !== -1 && endIndex !== -1) {
                    let prefix = content.substring(0, startIndex);
                    let suffix = content.substring(endIndex);
                    
                    // Clean up commas or spaces
                    if (prefix.trim().endsWith(',')) {
                      prefix = prefix.substring(0, prefix.lastIndexOf(','));
                    } else if (suffix.trim().startsWith(',')) {
                      suffix = suffix.substring(suffix.indexOf(',') + 1);
                    }
                    
                    const newContent = prefix + suffix;
                    fs.writeFileSync(framesFile, newContent, 'utf8');
                    console.log(`Successfully removed frame ${id} from src/data/frames.ts`);
                  }
                }
              }

              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true }));
            } catch (err: any) {
              console.error('Failed to delete custom frame:', err);
              res.writeHead(500, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: err.message }));
            }
          } else {
            next();
          }
        });
      }
    }
  ],
})

