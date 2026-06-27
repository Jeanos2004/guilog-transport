const fs = require('fs');
let code = fs.readFileSync('app/(admin)/admin/page.tsx', 'utf-8');

// 1. Add state variable newModuleDateFin
const dateDebutState = 'const [newModuleDateDebut, setNewModuleDateDebut] = useState("");';
if (!code.includes('const [newModuleDateFin, setNewModuleDateFin] = useState("");')) {
    code = code.replace(dateDebutState, dateDebutState + '\n  const [newModuleDateFin, setNewModuleDateFin] = useState("");');
}

// 2. Add scheduling state variables
const scheduleStates = `
  const [scheduleModalOpen, setScheduleModalOpen] = useState(false);
  const [scheduleModuleId, setScheduleModuleId] = useState("");
  const [scheduleModuleName, setScheduleModuleName] = useState("");
  const [scheduleDate, setScheduleDate] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [scheduleLocation, setScheduleLocation] = useState("");
  const [isScheduling, setIsScheduling] = useState(false);
`;
if (!code.includes('scheduleModalOpen')) {
    code = code.replace(dateDebutState, scheduleStates + '\n' + dateDebutState);
}

// 3. Add handleScheduleSession function
const scheduleFunction = `
  const handleScheduleSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scheduleModuleId || !scheduleDate || !scheduleTime) return;
    setIsScheduling(true);
    try {
      const allStudents = await db.getStudents();
      const enrolledStudents = allStudents.filter(s => s.enrolledCourses.includes(scheduleModuleId));
      
      const promises = enrolledStudents.map(student => {
        if (student.phone) {
          return fetch('/api/sms/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contact: student.phone,
              message: \`CFIG - Séance programmée pour le cours \${scheduleModuleName} le \${scheduleDate} à \${scheduleTime}. Soyez à l'heure ! \${scheduleLocation ? 'Lieu/Lien: ' + scheduleLocation : ''}\`
            })
          });
        }
        return Promise.resolve();
      });
      await Promise.all(promises);
      alert(\`Séance programmée et SMS envoyés à \${enrolledStudents.length} étudiant(s) avec succès !\`);
      setScheduleModalOpen(false);
      setScheduleDate("");
      setScheduleTime("");
      setScheduleLocation("");
    } catch (e) {
      console.error(e);
      alert("Erreur lors de la programmation de la séance.");
    } finally {
      setIsScheduling(false);
    }
  };
`;
if (!code.includes('handleScheduleSession')) {
    code = code.replace(/const handleConvertLead = async/, scheduleFunction + '\n  const handleConvertLead = async');
}

// 4. Update Save Module to include dateFin
if (!code.includes('dateFin: newModuleDateFin')) {
    code = code.replace(/dateDebut: newModuleDateDebut,/, 'dateDebut: newModuleDateDebut,\n        dateFin: newModuleDateFin,');
}

// 5. Update Edit Module to set dateFin
if (!code.includes('setNewModuleDateFin(d?.dateFin ?? "");')) {
    code = code.replace(/setNewModuleDateDebut\(d\?\.dateDebut \?\? ""\);/, 'setNewModuleDateDebut(d?.dateDebut ?? "");\n    setNewModuleDateFin(d?.dateFin ?? "");');
}

// 6. Update Form Reset to reset dateFin
if (!code.includes('setNewModuleDateFin("");')) {
    code = code.replace(/setNewModuleDateDebut\(""\);/, 'setNewModuleDateDebut("");\n    setNewModuleDateFin("");');
}

// 7. Inject the DateFin input field in the modal
const dateDebutInputTarget = `<label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Date de Début (Optionnel)</label>`;
const dateFinInput = `
                              <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Date de Fin (Optionnel)</label>
                                <input
                                  type="text"
                                  className="w-full bg-gray-50 border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] rounded-none"
                                  placeholder="Ex: 30 Août 2026"
                                  value={newModuleDateFin}
                                  onChange={(e) => setNewModuleDateFin(e.target.value)}
                                />
                              </div>
`;
if (!code.includes('Date de Fin (Optionnel)')) {
    code = code.replace(/(<div>\s*<label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Date de Début \(Optionnel\)[\s\S]*?<\/div>)/, match => match + '\n' + dateFinInput);
}

// 8. Inject the "Programmer une séance" button in the module list
const editButtonTarget = `<button onClick={() => openEditModule(catIndex, modIndex, mod)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Modifier le module">`;
const scheduleButton = `
                                            <button onClick={() => {
                                              setScheduleModuleId(mod.id || mod.titre);
                                              setScheduleModuleName(mod.titre);
                                              setScheduleModalOpen(true);
                                            }} className="p-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors" title="Programmer une séance et notifier par SMS">
                                              <Calendar className="w-4 h-4" />
                                            </button>
`;
if (!code.includes('setScheduleModalOpen(true)')) {
    code = code.replace(/(<button onClick={\(\) => openEditModule\(catIndex, modIndex, mod\)} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors" title="Modifier le module">)/g, match => scheduleButton + '\n' + match);
}

// 9. Inject the Schedule Modal at the bottom of the file (before the last closing div of AdminPage)
const scheduleModalHTML = `
      {/* SCHEDULE MODAL */}
      {scheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm">
          <div className="bg-white max-w-md w-full rounded-none shadow-2xl animate-fade-in flex flex-col max-h-[90vh]">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-xl font-heading font-black text-gray-900 uppercase tracking-tight">Programmer une séance</h3>
                <p className="text-xs text-gray-500 mt-1">Pour la formation : <span className="font-bold text-[var(--color-primary)]">{scheduleModuleName}</span></p>
              </div>
              <button onClick={() => setScheduleModalOpen(false)} className="text-gray-400 hover:text-gray-600 p-2">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <form onSubmit={handleScheduleSession} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Date de la séance *</label>
                  <input type="date" required value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} className="w-full bg-gray-50 border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] rounded-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Heure (ex: 18h00 - 20h00) *</label>
                  <input type="text" required value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} className="w-full bg-gray-50 border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] rounded-none" placeholder="18h00 - 20h00" />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-1.5">Lieu ou Lien Google Meet (Optionnel)</label>
                  <input type="text" value={scheduleLocation} onChange={e => setScheduleLocation(e.target.value)} className="w-full bg-gray-50 border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:border-[var(--color-primary)] rounded-none" placeholder="Salle 2 ou https://meet.google..." />
                </div>
                <div className="pt-4 flex gap-3">
                  <button type="button" onClick={() => setScheduleModalOpen(false)} className="px-6 py-2.5 border border-gray-300 text-gray-700 font-bold uppercase text-xs tracking-wider hover:bg-gray-50 transition-colors">Annuler</button>
                  <button type="submit" disabled={isScheduling} className="flex-1 px-6 py-2.5 bg-[var(--color-primary)] text-white font-bold uppercase text-xs tracking-wider hover:bg-[#3b34c2] transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                    {isScheduling ? "Envoi..." : "Programmer & Notifier (SMS)"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
`;

if (!code.includes('SCHEDULE MODAL')) {
    // Inject right before the final closing div of the main return
    code = code.replace(/(?=\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*<\/div>\s*$)/, scheduleModalHTML);
}

fs.writeFileSync('app/(admin)/admin/page.tsx', code);
console.log('Injected Scheduling feature and dateFin successfully!');
