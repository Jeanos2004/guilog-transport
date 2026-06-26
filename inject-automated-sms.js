const fs = require('fs');
let code = fs.readFileSync('app/(admin)/admin/page.tsx', 'utf-8');

// Injection 1: Enrollment / Payment
const enrollTarget = `          setPayments(await studentDb.getPayments());
        }`;
const enrollSms = `
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

if (code.includes(enrollTarget)) {
  code = code.replace(enrollTarget, enrollTarget + '\n' + enrollSms);
  console.log("Injected SMS automation for Payments.");
} else {
  console.log("Failed to find target for Payments.");
}

// Injection 2: Lead Conversion
const leadTarget = `await db.deleteLead(leadToConvert.id);`;
const leadSms = `
        // [Automated SMS for Conversion]
        if (leadToConvert.phone) {
          fetch('/api/sms/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contact: leadToConvert.phone,
              message: \`Félicitations \${leadToConvert.fullName}, votre inscription est validée ! Consultez vos emails pour vos identifiants d'accès. - CFIG\`
            })
          }).catch(e => console.error("SMS Conversion Error:", e));
        }
`;

if (code.includes(leadTarget)) {
  code = code.replace(leadTarget, leadTarget + '\n' + leadSms);
  console.log("Injected SMS automation for Lead Conversion.");
} else {
  console.log("Failed to find target for Lead Conversion.");
}

fs.writeFileSync('app/(admin)/admin/page.tsx', code);
