const fs = require('fs');

let c = fs.readFileSync('app/api/invoice/generate/route.ts', 'utf-8');

c = c.replace(
  'const executablePath = await chromium.executablePath();',
  `const isDev = process.env.NODE_ENV === 'development';
    const executablePath = isDev 
      ? 'C:\\\\Program Files\\\\Google\\\\Chrome\\\\Application\\\\chrome.exe' 
      : await chromium.executablePath();`
);

fs.writeFileSync('app/api/invoice/generate/route.ts', c, 'utf-8');
