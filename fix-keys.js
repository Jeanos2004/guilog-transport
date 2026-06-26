const fs = require('fs');
let code = fs.readFileSync('app/(admin)/admin/page.tsx', 'utf-8');

// Replace category: f.titre with category: f.categorie
code = code.replace(/category:\s*f\.titre/g, 'category: f.categorie');

// Make the key more robust
code = code.replace(/key=\{`\$\{c\.category\}-\$\{c\.id\}`\}/g, 'key={`${c.category}-${c.id || c.title}`}');

fs.writeFileSync('app/(admin)/admin/page.tsx', code);
console.log('Fixed undefined category and keys.');
