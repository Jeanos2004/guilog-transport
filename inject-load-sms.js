const fs = require('fs');
let code = fs.readFileSync('app/(admin)/admin/page.tsx', 'utf-8');

const loadSmsBalanceCode = `
    try {
      const res = await fetch('/api/sms/balance');
      if (res.ok) {
        const data = await res.json();
        setSmsBalance(data.solde);
      }
    } catch (e) {
      console.error('Failed to load SMS balance', e);
    }
`;

// Insert inside refreshAllData after setPayments(await studentDb.getPayments());
if (!code.includes("const res = await fetch('/api/sms/balance');")) {
    code = code.replace(/setPayments\(await studentDb\.getPayments\(\)\);/, match => match + '\n' + loadSmsBalanceCode);
    fs.writeFileSync('app/(admin)/admin/page.tsx', code);
    console.log("Injected loadSmsBalance into refreshAllData");
} else {
    console.log("loadSmsBalance already exists");
}
