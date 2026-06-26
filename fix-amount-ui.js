const fs = require('fs');
let code = fs.readFileSync('app/(admin)/admin/page.tsx', 'utf-8');

// 1. Fix the react key warnings and include 'prix' in flatMaps
code = code.replace(/f\.modules\.map\(m => \(\{\s*id: m\.id,\s*title: m\.titre,\s*category: f\.titre\s*\}\)\)/g, 'f.modules.map(m => ({ id: m.id, title: m.titre, category: f.titre, prix: m.prix }))');
code = code.replace(/f\.modules\.map\(m => \(\{\s*id: m\.id,\s*title: m\.titre,\s*category: f\.titre,\s*sessions: m\.sessions\s*\}\)\)/g, 'f.modules.map(m => ({ id: m.id, title: m.titre, category: f.titre, sessions: m.sessions, prix: m.prix }))');

code = code.replace(/<option key=\{c\.id\}/g, '<option key={`${c.category}-${c.id}`}');

// 2. Fix the partial payment form UI to hide amount when integral
const partialFormRegex = /<select name="paymentType" className="bg-slate-50 border border-gray-250 px-2 py-1\.5 text-\[10px\] rounded-none focus:outline-none focus:border-\[var\(--color-primary\)\] transition-all">/;
const partialFormReplacement = `<select 
  name="paymentType" 
  className="bg-slate-50 border border-gray-250 px-2 py-1.5 text-[10px] rounded-none focus:outline-none focus:border-[var(--color-primary)] transition-all"
  onChange={(e) => {
    const input = e.target.parentElement.querySelector('input[name="amount"]');
    if(input) {
      if(e.target.value === 'integral') {
        input.style.display = 'none';
        input.required = false;
        input.value = '';
      } else {
        input.style.display = 'block';
        input.required = true;
      }
    }
  }}
>`;
code = code.replace(partialFormRegex, partialFormReplacement);

// 3. Fix the partial payment submit logic
const partialSubmitRegex = /const amount = Number\(formData\.get\('amount'\)\);\s*const paymentType = formData\.get\('paymentType'\) as string;\s*if \(amount > 0\) \{/;
const partialSubmitReplacement = `let amount = Number(formData.get('amount'));
                                          const paymentType = formData.get('paymentType') as string;
                                          if (paymentType === 'integral') {
                                            amount = (matchedCourse.prix || 0) - totalPaid;
                                          }
                                          if (amount > 0) {`;
code = code.replace(partialSubmitRegex, partialSubmitReplacement);

// 4. Fix manual enrollment UI
const manualEnrollFormRegex = /<select name="paymentType" className="bg-slate-50 border border-gray-250 px-3 py-2\.5 text-xs rounded-none focus:outline-none focus:border-\[var\(--color-primary\)\] transition-all">/;
const manualEnrollFormReplacement = `<select 
  name="paymentType" 
  className="bg-slate-50 border border-gray-250 px-3 py-2.5 text-xs rounded-none focus:outline-none focus:border-[var(--color-primary)] transition-all"
  onChange={(e) => {
    const input = e.target.parentElement.querySelector('input[name="amount"]');
    if(input) {
      if(e.target.value === 'integral') {
        input.style.display = 'none';
        input.required = false;
        input.value = '';
      } else {
        input.style.display = 'block';
        input.required = true;
      }
    }
  }}
>`;
code = code.replace(manualEnrollFormRegex, manualEnrollFormReplacement);

// 5. Fix manual enrollment submit logic
const manualSubmitRegex = /const amount = Number\(amountStr\);\s*if \(amount && !isNaN\(amount\) && amount > 0\) \{/;
const manualSubmitReplacement = `let amount = Number(amountStr);
      let courseName = courseId;
      let coursePrice = 0;
      formations.forEach(cat => {
        const mod = cat.modules.find(m => m.id === courseId);
        if (mod) {
           courseName = mod.titre;
           coursePrice = mod.prix || 0;
        }
      });
      if (paymentType === 'integral') {
         amount = coursePrice;
      }
      if (amount && !isNaN(amount) && amount > 0) {`;
code = code.replace(manualSubmitRegex, manualSubmitReplacement);

// Remove the redundant courseName logic inside the block since we moved it out
const redundantCourseNameRegex = /let courseName = courseId;\s*formations\.forEach\(cat => \{\s*const mod = cat\.modules\.find\(m => m\.id === courseId\);\s*if \(mod\) courseName = mod\.titre;\s*\}\);/;
code = code.replace(redundantCourseNameRegex, '');

fs.writeFileSync('app/(admin)/admin/page.tsx', code);
console.log('UI and logic fixes applied successfully.');
