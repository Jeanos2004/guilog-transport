const fs = require('fs');
let code = fs.readFileSync('app/(admin)/admin/page.tsx', 'utf-8');

// 1. Remove the wrong injection
const wrongInjection = `          // [Automated SMS for Payment]
          if (student?.phone) {
            fetch('/api/sms/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contact: student.phone,
                message: \`CFIG - Nous avons bien reçu votre paiement de \${amount.toLocaleString()} GNF pour la formation \${courseName}. Merci !\`
              })
            }).catch(e => console.error("SMS Payment Error:", e));
          }`;

if(code.includes(wrongInjection)) {
   code = code.replace(wrongInjection, "");
   console.log("Removed wrong injection");
} else {
   console.log("Could not find wrong injection, trying to strip it via regex");
   code = code.replace(/\/\/ \[Automated SMS for Payment\][\s\S]*?console\.error\("SMS Payment Error:", e\)\);\s*\}/g, "");
}

// 2. Add it properly in handleEnrollStudent
const enrollTarget = `paymentType: paymentType || "integral",
            date: new Date().toISOString()
          });
          setPayments(await studentDb.getPayments());
        }`;

const rightInjection = `paymentType: paymentType || "integral",
            date: new Date().toISOString()
          });
          setPayments(await studentDb.getPayments());

          // [Automated SMS for Payment]
          if (student?.phone) {
            fetch('/api/sms/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contact: student.phone,
                message: \`CFIG - Nous avons bien reçu votre paiement de \${amount.toLocaleString()} GNF pour la formation \${courseName}. Merci !\`
              })
            }).catch(e => console.error("SMS Payment Error:", e));
          }
        }`;

if(code.includes(enrollTarget)) {
   code = code.replace(enrollTarget, rightInjection);
   console.log("Injected in handleEnrollStudent");
}

fs.writeFileSync('app/(admin)/admin/page.tsx', code);
