const sharp = require('sharp');

async function inspect() {
  const file = 'C:/Users/Rangga/.gemini/antigravity-ide/brain/274139a2-4e57-4a18-9f3b-8f45e1fb85d2/media__1784705782891.png';
  const meta = await sharp(file).metadata();
  console.log(`Nailong Sheet Dimensions: ${meta.width} x ${meta.height}`);
}

inspect();
