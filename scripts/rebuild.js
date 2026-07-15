const fs = require('fs');
const { execSync } = require('child_process');

// 1. Restore the original page.tsx
try {
  execSync('git checkout "app/(admin)/admin/page.tsx"', { cwd: 'c:/Workspace/GuilogTrans' });
} catch (e) {
  console.log('Error checking out:', e.message);
}

const path = 'c:/Workspace/GuilogTrans/app/(admin)/admin/page.tsx';
let content = fs.readFileSync(path, 'utf-8');

// 2. Remove the isLoggedIn block entirely
const loginBlockStart = '  if (!isLoggedIn) {';
const loginBlockEnd = '  return (\n    <div className="h-screen bg-[var(--color-gray)] flex font-sans text-gray-800 overflow-hidden">';

const startIdx = content.indexOf(loginBlockStart);
const endIdx = content.indexOf(loginBlockEnd);
if (startIdx !== -1 && endIdx !== -1) {
  content = content.substring(0, startIdx) + content.substring(endIdx);
}

// 3. Remove the layout from the start of the return statement, down to the actual main content area
// The return statement is now at the top of content.substring(endIdx)
const layoutStart = '  return (\n    <div className="h-screen bg-[var(--color-gray)] flex font-sans text-gray-800 overflow-hidden">';
// We will replace up to the header
const layoutEnd = '      <main className="flex-grow flex flex-col h-full overflow-y-auto">';
const mainIdx = content.indexOf(layoutEnd);

if (mainIdx !== -1) {
  // Replace everything between the layoutStart and layoutEnd with just `<div className="w-full">`
  content = content.replace(content.substring(content.indexOf(layoutStart), mainIdx + layoutEnd.length), '  return (\n    <div className="w-full">');
}

// 4. Remove AnimatePresence completely to avoid missing closing tag issues
content = content.replace(/<AnimatePresence mode="wait">/g, '<div className="tab-transition">');
content = content.replace(/<AnimatePresence>/g, '<div className="tab-transition">');
content = content.replace(/<\/AnimatePresence>/g, '</div>');

// 5. Replace `activeTab` definition
content = content.replace(
  'const [activeTab, setActiveTab] = useState<"overview" | "inscriptions" | "formations" | "actualites" | "testimonials" | "galerie" | "messages" | "settings" | "users" | "students" | "analytics">("overview");',
  'const searchParams = useSearchParams();\n  const activeTab = searchParams.get("tab") || "overview";\n  const setActiveTab = (tab: any) => router.push(`/admin?tab=${tab}`);'
);
content = content.replace(
  'const [overviewFilter, setOverviewFilter] = useState<"all" | "month" | "quarter" | "year">("all");',
  'const overviewFilter = searchParams.get("filter") || "all";\n  const setOverviewFilter = (f: any) => router.push(`/admin?tab=${activeTab}&filter=${f}`);'
);

// Add useSearchParams to imports
content = content.replace('import { useRouter } from "next/navigation";', 'import { useRouter, useSearchParams } from "next/navigation";');

// 6. Fix the closing tag at the end. Since we removed `<main>`, we should remove `</main>` at the end of the file.
// We'll just look for `</main>` and remove it.
content = content.replace('      </main>', '');

// 7. Fix `auth.onAuthStateChanged`
content = content.replace(
  /const unsubscribe = onAuthStateChanged\(auth, async \(user\) => \{[\s\S]*?return \(\) => unsubscribe\(\);\n  \}, \[\]\);/m,
  'refreshAllData();\n  }, []);'
);

// 8. Write it back
fs.writeFileSync(path, content);
console.log('Rebuilt successfully');
