const fs = require('fs');
let code = fs.readFileSync('app/(admin)/admin/page.tsx', 'utf-8');

const paymentSmsCode = `
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
`;

// Inject into handleEnrollStudent right after setPayments(await studentDb.getPayments());
code = code.replace(/(setPayments\(await studentDb\.getPayments\(\)\);\s*\})/, match => {
   if (!code.includes('CFIG - Nous avons bien reçu votre paiement')) {
      return match + '\n' + paymentSmsCode;
   }
   return match;
});

fs.writeFileSync('app/(admin)/admin/page.tsx', code);
console.log("Injected SMS automation for handleEnrollStudent");
