const fs = require('fs');

const origPath = 'app/(admin)/admin/page.tsx';
let content = fs.readFileSync(origPath, 'utf-8');

const divStarts = (content.match(/<div/g) || []).length;
const divEnds = (content.match(/<\/div>/g) || []).length;

const motionStarts = (content.match(/<motion\./g) || []).length;
const motionEnds = (content.match(/<\/motion\./g) || []).length;

const formStarts = (content.match(/<form/g) || []).length;
const formEnds = (content.match(/<\/form>/g) || []).length;

console.log(`divs: ${divStarts} - ${divEnds} (diff: ${divStarts - divEnds})`);
console.log(`motions: ${motionStarts} - ${motionEnds} (diff: ${motionStarts - motionEnds})`);
console.log(`forms: ${formStarts} - ${formEnds} (diff: ${formStarts - formEnds})`);
