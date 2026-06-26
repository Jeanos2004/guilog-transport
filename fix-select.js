const fs = require('fs');
let code = fs.readFileSync('app/(admin)/admin/page.tsx', 'utf-8');

// target 1
let oldT1 = `                                  <select
                                    name="courseId"
                                    required
                                    className="w-full bg-slate-50 border border-gray-250 px-4 py-2.5 text-xs rounded-none focus:outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all text-gray-800"
                                    defaultValue=""
                                  >`;
let newT1 = `                                  <select
                                    name="courseId"
                                    required
                                    size={5}
                                    className="w-full bg-slate-50 border border-gray-250 px-4 py-2.5 text-xs rounded-none focus:outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all text-gray-800"
                                    defaultValue=""
                                  >`;
code = code.replace(oldT1, newT1);

// target 2
let oldT2 = `                  <select
                    required
                    value={leadCourseId}
                    onChange={(e) => setLeadCourseId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-none border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)]"
                  >`;
let newT2 = `                  <select
                    required
                    size={5}
                    value={leadCourseId}
                    onChange={(e) => setLeadCourseId(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-none border border-gray-200 focus:ring-2 focus:ring-[var(--color-primary)]"
                  >`;
code = code.replace(oldT2, newT2);

fs.writeFileSync('app/(admin)/admin/page.tsx', code);
console.log('Select size updated');
