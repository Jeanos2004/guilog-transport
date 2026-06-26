const fs = require('fs');
let code = fs.readFileSync('app/(admin)/admin/page.tsx', 'utf-8');

// Find the line containing `alert: unreadMessagesCount > 0 }`
const targetSearch = 'alert: unreadMessagesCount > 0 }';

if (code.includes(targetSearch)) {
  const replacement = targetSearch + `,
                        { title: "Solde SMS", val: smsBalance !== null ? \`\${smsBalance}\` : "...", desc: "Crédits restants", trend: "PASSEINFO", icon: <MessageSquare className="w-5 h-5 text-orange-600" />, bg: "bg-orange-50" }`;
  code = code.replace(targetSearch, replacement);
  fs.writeFileSync('app/(admin)/admin/page.tsx', code);
  console.log('Successfully injected SMS card into the array.');
} else {
  console.log('Target line not found');
}
