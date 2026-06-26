const fs = require('fs');
let code = fs.readFileSync('app/(admin)/admin/page.tsx', 'utf-8');

// 1. Add MessageSquare import
if(!code.includes('MessageSquare')) {
  code = code.replace(/import \{([^}]+)\} from 'lucide-react';/, (match, p1) => {
    return `import {${p1}, MessageSquare} from 'lucide-react';`;
  });
}

// 2. Add state
const stateInject = `  const [inscriptions, setInscriptions] = useState<InscriptionRequest[]>([]);
  const [smsBalance, setSmsBalance] = useState<number | null>(null);`;
if (!code.includes('const [smsBalance')) {
  code = code.replace(/const \[inscriptions, setInscriptions\] = useState<InscriptionRequest\[\]>\(\[\]\);/, stateInject);
}

// 3. Add fetch inside AdminPage
const fetchInject = `
    const loadSmsBalance = async () => {
      try {
        const res = await fetch('/api/sms/balance');
        if (res.ok) {
          const data = await res.json();
          setSmsBalance(data.solde);
        }
      } catch (e) {
        console.error('Failed to load SMS balance', e);
      }
    };
    loadSmsBalance();
`;
if (!code.includes('loadSmsBalance()')) {
  code = code.replace(/setPayments\(await studentDb\.getPayments\(\)\);\s*setArticles/, match => match + fetchInject);
}

// 4. Update Grid columns and add to array
if (!code.includes('Solde SMS')) {
  code = code.replace(/lg:grid-cols-4 gap-6"/, 'lg:grid-cols-5 gap-6"');
  
  const smsCard = `,
                        { title: "Solde SMS", val: smsBalance !== null ? \`\${smsBalance}\` : "...", desc: "Crédits restants", trend: "PASSEINFO API", icon: <MessageSquare className="w-5 h-5 text-orange-600" />, bg: "bg-orange-50" }`;
  code = code.replace(/unreadMessagesCount > 0 \}\n\s*\]\.map/, match => match.replace(/\]\.map/, smsCard + '\n                      ].map'));
}

fs.writeFileSync('app/(admin)/admin/page.tsx', code);
console.log('Fixed SMS Balance card.');
