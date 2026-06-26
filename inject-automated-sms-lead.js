const fs = require('fs');
let code = fs.readFileSync('app/(admin)/admin/page.tsx', 'utf-8');

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

code = code.replace(/\/\/ 5\. Trigger Email Notification \(Conversion\)/, match => leadSms + '        ' + match);
fs.writeFileSync('app/(admin)/admin/page.tsx', code);
console.log('Injected Lead Conversion SMS!');
