const fs = require('fs');
const { execSync } = require('child_process');

execSync('git checkout "app/(admin)/admin/page.tsx"', { cwd: 'c:/Workspace/GuilogTrans' });
const content = fs.readFileSync('c:/Workspace/GuilogTrans/app/(admin)/admin/page.tsx', 'utf-8');

const divStarts = (content.match(/<div/g) || []).length;
const divEnds = (content.match(/<\/div>/g) || []).length;

console.log(`Original divs: ${divStarts} - ${divEnds} (diff: ${divStarts - divEnds})`);
