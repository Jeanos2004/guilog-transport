const fs = require('fs');
let code = fs.readFileSync('app/(admin)/admin/page.tsx', 'utf-8');

// Inject the handleSendSms function
const handleSendSmsFn = `
  const handleSendSms = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(!selectedStudent) return;
    const formData = new FormData(e.currentTarget);
    const message = formData.get('message') as string;
    const contact = selectedStudent.phone;
    if (!message || !contact) {
      alert("Message ou numéro de téléphone manquant (l'étudiant n'a peut-être pas fourni de numéro).");
      return;
    }
    const btn = e.currentTarget.querySelector('button[type="submit"]') as HTMLButtonElement;
    const originalText = btn.innerHTML;
    btn.innerHTML = "Envoi...";
    btn.disabled = true;
    
    try {
      const res = await fetch('/api/sms/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact, message })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'envoi du SMS");
      alert("SMS envoyé avec succès !");
      (e.target as HTMLFormElement).reset();
    } catch(err: any) {
      alert(err.message);
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  };
`;

// Insert it before handleConvertLead
code = code.replace(/const handleConvertLead = /, handleSendSmsFn + '\n  const handleConvertLead = ');

// Inject the UI section in the modal before {/* Footer Actions */}
const smsSection = `                            <div className="pt-4 border-t border-gray-150 space-y-3">
                              <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-blue-500">Communiquer par SMS</h4>
                              {selectedStudent.phone ? (
                                <form onSubmit={handleSendSms} className="space-y-3">
                                  <textarea 
                                    name="message" 
                                    rows={3} 
                                    required
                                    placeholder="Tapez votre message ici... (ex: Bonjour, n'oubliez pas votre cours demain.)"
                                    className="w-full bg-slate-50 border border-blue-200 px-4 py-2.5 text-xs rounded-none focus:outline-none focus:border-blue-500 focus:bg-white transition-all text-gray-800 resize-none"
                                  ></textarea>
                                  <div className="flex justify-between items-center">
                                    <span className="text-[10px] text-gray-400">Envoi vers : {selectedStudent.phone}</span>
                                    <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-none transition-colors">
                                      Envoyer le SMS
                                    </button>
                                  </div>
                                </form>
                              ) : (
                                <p className="text-xs text-amber-700 bg-amber-50 p-4 border border-amber-200">
                                  Impossible d'envoyer un SMS, cet étudiant n'a pas renseigné de numéro de téléphone.
                                </p>
                              )}
                            </div>
                            
                            {/* Footer Actions */}
`;

code = code.replace(/\{\/\*\s*Footer Actions\s*\*\/\}/, smsSection);

fs.writeFileSync('app/(admin)/admin/page.tsx', code);
console.log('SMS feature added to student profile.');
