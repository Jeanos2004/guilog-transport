const fs = require('fs');
let code = fs.readFileSync('app/(admin)/admin/page.tsx', 'utf-8');

// Injection 1: Enrollment / Payment
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

if (code.includes('setPayments(await studentDb.getPayments());')) {
  code = code.replace(/setPayments\(await studentDb\.getPayments\(\)\);/, match => match + '\n' + enrollSms);
  console.log("Injected SMS automation for Payments.");
} else {
  console.log("Failed to find target for Payments.");
}

// Injection 2: Lead Conversion
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

if (code.includes('await db.deleteLead(leadToConvert.id);')) {
  code = code.replace(/await db\.deleteLead\(leadToConvert\.id\);/, match => match + '\n' + leadSms);
  console.log("Injected SMS automation for Lead Conversion.");
} else {
  console.log("Failed to find target for Lead Conversion.");
}

// Additional Injection 3: Partial Payment (handlePartialPayment in admin page)
// Let's also check if there is a handlePartialPayment or similar, wait, handleRecordPayment
if (code.includes('const handleRecordPayment =')) {
    const recordPaymentSms = `
          // [Automated SMS for Partial Payment]
          const st = students.find(s => s.uid === selectedStudent.uid);
          if (st && st.phone) {
            fetch('/api/sms/send', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                contact: st.phone,
                message: \`CFIG - Nous avons bien reçu votre paiement de \${amount.toLocaleString()} GNF pour la formation \${courseName}. Merci !\`
              })
            }).catch(e => console.error("SMS Payment Error:", e));
          }
`;
    // We can inject it before `alert("Paiement enregistré");`
    if(code.includes('alert("Paiement enregistré avec succès !");')) {
       code = code.replace(/alert\("Paiement enregistré avec succès !"\);/, match => recordPaymentSms + '\n        ' + match);
       console.log("Injected SMS automation for Partial Payments.");
    }
}


fs.writeFileSync('app/(admin)/admin/page.tsx', code);
