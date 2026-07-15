const fs = require('fs');

const origPath = 'app/(admin)/admin/page.tsx';
let content = fs.readFileSync(origPath, 'utf-8');

// I'll just compile with Next.js or use tsc to find the issue.
// Actually, let's just print the last 50 lines to see if there's any obvious issue.
const lines = content.split('\n');
console.log(lines.slice(-50).join('\n'));
