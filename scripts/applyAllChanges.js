const { execSync } = require("child_process");
const fs = require("fs");

// 1. Get clean file from git (it has correct UTF-8 French chars but some labels might be corrupted in git too)
const gitContent = execSync("git show HEAD:app/(admin)/admin/page.tsx").toString("utf8");

// Check for corruptions in git
const badInGit = gitContent.split("\n").filter(l => /\u00c3[\u0080-\u00bf]/.test(l));
console.log("Corrupted lines in git HEAD:", badInGit.length);
if (badInGit.length > 0) {
  console.log("Sample:", badInGit[0].slice(0, 100));
}

// 2. Start with git content
let content = gitContent;

// 3. Fix all double-UTF8-encoded French chars
// These happen when UTF-8 bytes are interpreted as Latin-1 then re-encoded as UTF-8
// é (U+00E9) → UTF-8: 0xC3 0xA9 → Latin-1: Ã © → double encoded: Ã©
const fixes = [
  [/\u00c3\u00a9/g, "\u00e9"],  // é
  [/\u00c3\u00a8/g, "\u00e8"],  // è
  [/\u00c3\u00aa/g, "\u00ea"],  // ê
  [/\u00c3\u00ab/g, "\u00eb"],  // ë
  [/\u00c3\u00a0/g, "\u00e0"],  // à
  [/\u00c3\u00a2/g, "\u00e2"],  // â
  [/\u00c3\u00ae/g, "\u00ee"],  // î
  [/\u00c3\u00af/g, "\u00ef"],  // ï
  [/\u00c3\u00b4/g, "\u00f4"],  // ô
  [/\u00c3\u00b9/g, "\u00f9"],  // ù
  [/\u00c3\u00bb/g, "\u00fb"],  // û
  [/\u00c3\u00bc/g, "\u00fc"],  // ü
  [/\u00c3\u00a7/g, "\u00e7"],  // ç
  [/\u00c3\u0089/g, "\u00c9"],  // É
  [/\u00c3\u0088/g, "\u00c8"],  // È
  [/\u00c3\u008a/g, "\u00ca"],  // Ê
  [/\u00c3\u0090/g, "\u00d0"],  // Ð
  [/\u00c3\u00b3/g, "\u00f3"],  // ó
  [/\u00c3\u00ba/g, "\u00fa"],  // ú
  [/\u00e2\u0080\u0094/g, "\u2014"],  // em dash —
  [/\u00e2\u0080\u0099/g, "\u2019"],  // right apostrophe '
  [/\u00e2\u0080\u009c/g, "\u201c"],  // left quote "
  [/\u00e2\u0080\u009d/g, "\u201d"],  // right quote "
  [/\u00c5\u0092/g, "\u0152"],  // Œ
  [/\u00c5\u0093/g, "\u0153"],  // œ
  [/\u00e2\u0080\u00a6/g, "\u2026"],  // ellipsis …
];

let fixCount = 0;
for (const [from, to] of fixes) {
  const before = content;
  content = content.replace(from, to);
  if (content !== before) fixCount++;
}
console.log("Applied", fixCount, "encoding fix patterns");

// 4. Apply code changes

// Add Suspense + useCallback
if (!content.includes("useCallback, Suspense")) {
  content = content.replace(
    /import \{ useState, useEffect, useMemo(, useCallback)? \} from "react";/,
    'import { useState, useEffect, useMemo, useCallback, Suspense } from "react";'
  );
  console.log("✓ Added Suspense + useCallback");
}

// Add useSearchParams
if (!content.includes("useSearchParams")) {
  content = content.replace(
    'import { useRouter } from "next/navigation";',
    'import { useRouter, useSearchParams } from "next/navigation";'
  );
  console.log("✓ Added useSearchParams");
}

// Add Clapperboard icon
if (!content.includes("Clapperboard")) {
  content = content.replace(
    "  Sparkles\n} from \"lucide-react\";",
    "  Sparkles,\n  Clapperboard\n} from \"lucide-react\";"
  );
  console.log("✓ Added Clapperboard");
}

// Add CourseBuilderInline import (only if not already there)
const cbImport = 'import { CourseBuilderInline } from "@/components/admin/CourseBuilderInline";';
if (!content.includes(cbImport)) {
  content = content.replace(
    'import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";',
    'import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts";\n' + cbImport
  );
  console.log("✓ Added CourseBuilderInline import");
}

// Fix activeTab state + URL sync
if (!content.includes("useSearchParams()")) {
  content = content.replace(
    `  // === ACTIVE TAB STATE ===
  const [activeTab, setActiveTab] = useState<"overview" | "inscriptions" | "formations" | "actualites" | "testimonials" | "galerie" | "messages" | "settings" | "users" | "students" | "analytics">("overview");`,
    `  // === ACTIVE TAB STATE (synced with URL ?tab=...) ===
  type TabId = "overview" | "inscriptions" | "formations" | "actualites" | "testimonials" | "galerie" | "messages" | "settings" | "users" | "students" | "analytics" | "course-builder";
  const VALID_TABS: TabId[] = ["overview", "inscriptions", "formations", "actualites", "testimonials", "galerie", "messages", "settings", "users", "students", "analytics", "course-builder"];
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams.get("tab") as TabId | null;
  const [activeTab, setActiveTabState] = useState<TabId>(VALID_TABS.includes(tabFromUrl as TabId) ? tabFromUrl! : "overview");

  useEffect(() => {
    const tab = searchParams.get("tab") as TabId | null;
    if (tab && VALID_TABS.includes(tab)) setActiveTabState(tab);
  }, [searchParams]);

  const setActiveTab = useCallback((tab: TabId) => {
    setActiveTabState(tab);
    const params = new URLSearchParams(window.location.search);
    params.set("tab", tab);
    router.replace(\`/admin?\${params.toString()}\`, { scroll: false });
  }, [router]);`
  );
  console.log("✓ Added URL sync for activeTab");
}

// Add course-builder to MOBILE sidebar (before Configuration group)
const mobileSidebarTarget = `                  {
                    title: "Configuration",
                    items: [
                      { id: "users", label: "Utilisateurs Admin", icon: <ShieldCheck className="w-4 h-4" /> },
                      { id: "param\u00e8tres", label: "Param\u00e8tres", icon: <Settings className="w-4 h-4" /> }
                    ]
                  }
                ].map((group, gIdx) => (
                  <div key={gIdx} className="space-y-1.5">
                    <span className="block px-3 text-[9px] font-extrabold uppercase tracking-widest text-gray-500">
                      {group.title}
                    </span>
                    <div className="space-y-0.5">
                      {group.items.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              setActiveTab(tab.id as any);
                              setSearchQuery("");
                              setStatusFilter("Tous");
                              setMobileMenuOpen(false);
                            }}`;

// Find by looking for the mobile sidebar Paramètres entry and the .map after
const mobileMark = `{ id: "settings", label: "Param\u00e8tres", icon: <Settings className="w-4 h-4" /> }
                    ]
                  }
                ].map((group, gIdx) => (
                  <div key={gIdx} className="space-y-1.5">
                    <span className="block px-3 text-[9px] font-extrabold uppercase tracking-widest text-gray-500">
                      {group.title}
                    </span>
                    <div className="space-y-0.5">
                      {group.items.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              setActiveTab(tab.id as any);
                              setSearchQuery("");
                              setStatusFilter("Tous");
                              setMobileMenuOpen(false);
                            }}`;

if (!content.includes("E-Learning")) {
  // Find the two sidebar groups (mobile + desktop) that end with settings and add course-builder before them
  // Mobile sidebar
  let idx = content.indexOf(mobileMark);
  if (idx !== -1) {
    const insert = `{ id: "settings", label: "Param\u00e8tres", icon: <Settings className="w-4 h-4" /> }
                    ]
                  },
                  {
                    title: "E-Learning",
                    items: [
                      { id: "course-builder", label: "Cours Builder", icon: <Clapperboard className="w-4 h-4" /> },
                    ]
                  }
                ].map((group, gIdx) => (
                  <div key={gIdx} className="space-y-1.5">
                    <span className="block px-3 text-[9px] font-extrabold uppercase tracking-widest text-gray-500">
                      {group.title}
                    </span>
                    <div className="space-y-0.5">
                      {group.items.map((tab) => {
                        const isActive = activeTab === tab.id;
                        return (
                          <button
                            key={tab.id}
                            onClick={() => {
                              setActiveTab(tab.id as TabId);
                              setSearchQuery("");
                              setStatusFilter("Tous");
                              setMobileMenuOpen(false);
                            }}`;
    content = content.slice(0, idx) + insert + content.slice(idx + mobileMark.length);
    console.log("✓ Added course-builder to mobile sidebar");
  } else {
    console.log("⚠ Mobile sidebar target not found, will do string replace");
    content = content.replace(
      /setActiveTab\(tab\.id as any\);\s*\n(\s*)setSearchQuery/g,
      (m, sp) => `setActiveTab(tab.id as TabId);\n${sp}setSearchQuery`
    );
  }

  // Desktop sidebar - simpler approach: find the second occurrence of similar pattern
  const desktopSettings = `{ id: "settings", label: "Param\u00e8tres", icon: <Settings className="w-4 h-4" /> }
              ]
            }
          ].map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              <span className="block px-3 text-[9px] font-extrabold uppercase tracking-widest text-gray-500">
                {group.title}
              </span>
              <div className="space-y-0.5">
                {group.items.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);`;

  const deskIdx = content.indexOf(desktopSettings);
  if (deskIdx !== -1) {
    const deskInsert = `{ id: "settings", label: "Param\u00e8tres", icon: <Settings className="w-4 h-4" /> }
              ]
            },
            {
              title: "E-Learning",
              items: [
                { id: "course-builder", label: "Cours Builder", icon: <Clapperboard className="w-4 h-4" /> },
              ]
            }
          ].map((group, gIdx) => (
            <div key={gIdx} className="space-y-1.5">
              <span className="block px-3 text-[9px] font-extrabold uppercase tracking-widest text-gray-500">
                {group.title}
              </span>
              <div className="space-y-0.5">
                {group.items.map((tab) => {
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as TabId);`;
    content = content.slice(0, deskIdx) + deskInsert + content.slice(deskIdx + desktopSettings.length);
    console.log("✓ Added course-builder to desktop sidebar");
  }
}

// Remove Programme and Séances modal tabs (tabs 4 and 5)
content = content.replace(
  `{(["Infos G\u00e9n\u00e9rales", "Fiche Technique", "P\u00e9dagogie", "Programme", "S\u00e9ances & Agenda"] as const).map((tab, i) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setModalTab((i + 1) as 1|2|3|4|5)}`,
  `{(["Infos G\u00e9n\u00e9rales", "Fiche Technique", "P\u00e9dagogie"] as const).map((tab, i) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setModalTab((i + 1) as 1|2|3)}`
);

// Fix modal dots
content = content.replace("{([1,2,3,4] as const).map(n => (", "{([1,2,3] as const).map(n => (");
content = content.replace("(modalTab - 1) as 1|2|3|4|5", "(modalTab - 1) as 1|2|3");
content = content.replace("modalTab < 5 ?", "modalTab < 3 ?");
content = content.replace("(modalTab + 1) as 1|2|3|4|5", "(modalTab + 1) as 1|2|3");

// Add course-builder header title
if (!content.includes(`"course-builder" && "Cours Builder"`)) {
  content = content.replace(
    `{activeTab === "settings" && "Param\u00e8tres du Site"}`,
    `{activeTab === "settings" && "Param\u00e8tres du Site"}
                {activeTab === "course-builder" && "Cours Builder"}`
  );
  console.log("✓ Added course-builder header title");
}

// Add course-builder tab render (before last </AnimatePresence>)
if (!content.includes(`activeTab === "course-builder" &&`)) {
  const animClose = content.lastIndexOf("          </AnimatePresence>");
  if (animClose !== -1) {
    const cbRender = `
            {/* ==== TAB: COURSE BUILDER ==== */}
            {activeTab === "course-builder" && (
              <motion.div
                key="course-builder"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                <CourseBuilderInline setActiveTab={(tab) => setActiveTab(tab as TabId)} />
              </motion.div>
            )}

`;
    content = content.slice(0, animClose) + cbRender + content.slice(animClose);
    console.log("✓ Added course-builder tab render");
  }
}

// Rename export and add Suspense wrapper
content = content.replace(
  "export default function AdminPage() {",
  "function AdminPageContent() {"
);

if (!content.includes("export default function AdminPage")) {
  content = content.trimEnd() + `

export default function AdminPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center"><div className="w-10 h-10 border-4 border-white/20 border-t-white rounded-full animate-spin" /></div>}>
      <AdminPageContent />
    </Suspense>
  );
}
`;
  console.log("✓ Added Suspense default export");
}

// Save
fs.writeFileSync("app/(admin)/admin/page.tsx", content, "utf8");

// Final check
const final = fs.readFileSync("app/(admin)/admin/page.tsx", "utf8");
const remaining = final.split("\n").filter(l => /\u00c3[\u0080-\u00bf]/.test(l));
console.log("\n✓ Saved. Remaining corrupted lines:", remaining.length);
console.log("Total lines:", final.split("\n").length);
console.log("Suspense in file:", final.includes("<Suspense"));
console.log("course-builder in sidebar:", (final.match(/course-builder/g) || []).length);
console.log("Étudiants correct:", final.includes("\u00c9tudiants"));
