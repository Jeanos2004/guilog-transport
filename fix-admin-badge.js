const fs = require('fs');
const file = 'c:/Workspace/cfig/app/(admin)/admin/page.tsx';
let content = fs.readFileSync(file, 'utf-8');

// 1. Add badge to the title
const search = '<h4 className="font-bold text-xs text-gray-800 leading-snug">{mod.titre}</h4>';
const replacement = `
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-bold text-xs text-gray-800 leading-snug">{mod.titre}</h4>
                                  <span className={\`px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wider text-white \${mod.details?.statutInscription === 'Fermée' ? 'bg-red-500' : 'bg-green-500'}\`}>
                                    {mod.details?.statutInscription === 'Fermée' ? 'Fermée' : 'Ouverte'}
                                  </span>
                                </div>
`.trim();

content = content.replace(search, replacement);

// 2. Disable Nouvelle Séance button
// Find the precise regex line to replace it
const btnRegex = /<button type="button" onClick=\{\(\) => setNewModuleSessions\(\[\.\.\.newModuleSessions, \{ id: 'session-'\+Date\.now\(\), title: 'Nouvelle s.ance', date: new Date\(\)\.toISOString\(\), duration: '2 heures', location: 'Si.ge CFIG', meetUrl: '', resources: \[\] \}\]\)\} className="flex items-center gap-1\.5 px-3 py-1\.5 bg-gray-900 text-white text-\[10px\] uppercase font-bold hover:bg-\[var\(--color-primary\)\] transition-colors">/;

const btnReplacement = `<button type="button" disabled={newModuleStatutInscription === 'Fermée'} onClick={() => setNewModuleSessions([...newModuleSessions, { id: 'session-'+Date.now(), title: 'Nouvelle séance', date: new Date().toISOString(), duration: '2 heures', location: 'Siège CFIG', meetUrl: '', resources: [] }])} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-[10px] uppercase font-bold hover:bg-[var(--color-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed">`;

content = content.replace(btnRegex, btnReplacement);

fs.writeFileSync(file, content);
console.log('Done!');
