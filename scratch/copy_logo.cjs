const fs = require('fs');

const srcLogo = 'C:/Users/Rangga/.gemini/antigravity-ide/brain/274139a2-4e57-4a18-9f3b-8f45e1fb85d2/media__1784706569772.png';
const destLogo = 'public/logo.png';

fs.copyFileSync(srcLogo, destLogo);
console.log(`Successfully copied new BaliSnap Studio logo to ${destLogo}`);
