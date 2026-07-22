const fs = require('fs');

const srcLogo = 'C:/Users/Rangga/.gemini/antigravity-ide/brain/274139a2-4e57-4a18-9f3b-8f45e1fb85d2/media__1784708950608.jpg';
const destLogoPng = 'public/logo.png';
const destLogoJpg = 'public/balisnap-logo.jpg';

fs.copyFileSync(srcLogo, destLogoPng);
fs.copyFileSync(srcLogo, destLogoJpg);
console.log('Successfully saved new BaliSnap Studio logo to public/logo.png and public/balisnap-logo.jpg');
