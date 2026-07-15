const fs = require('fs');

const path = 'app/(admin)/admin/page.tsx';
let content = fs.readFileSync(path, 'utf-8');

const loginBlockStart = '  if (!isLoggedIn) {';
const loginBlockEnd = '  return (\n    <div className="h-screen bg-[var(--color-gray)] flex font-sans text-gray-800 overflow-hidden">';

const startIdx = content.indexOf(loginBlockStart);
const endIdx = content.indexOf(loginBlockEnd);

if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + content.substring(endIdx);
}

const sidebarStart = '      {/* Mobile Sidebar Navigation Drawer */}';
const mainContentStart = '      {/* ================================================\n          2. MAIN CONTENT AREA\n      ================================================ */}\n      <main className="flex-grow flex flex-col h-full overflow-y-auto">';

const sidebarIdx = content.indexOf(sidebarStart);
const mainIdx = content.indexOf(mainContentStart);

if (sidebarIdx !== -1 && mainIdx !== -1) {
  content = content.substring(0, sidebarIdx) + content.substring(mainIdx + mainContentStart.length);
}

// Remove the AnimatePresence and <AnimatePresence> tags
content = content.replace(/<AnimatePresence>/g, '');
content = content.replace(/<\/AnimatePresence>/g, '');

fs.writeFileSync(path, content);
console.log('Replaced successfully');
