const fs = require('fs');
let code = fs.readFileSync('app/(admin)/admin/page.tsx', 'utf-8');

// 1. Update handleEnrollStudent
const oldHandleEnroll = `  const handleEnrollStudent = async (studentUid: string, courseId: string) => {
    try {
      await studentDb.enrollInCourse(studentUid, courseId);
      // Refresh students
      setStudents(await db.getStudents());
      alert("Étudiant inscrit avec succès !");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'inscription de l'étudiant.");
    }
  };`;

const newHandleEnroll = `  const handleEnrollStudent = async (e: React.FormEvent<HTMLFormElement>, studentUid: string) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const courseId = formData.get('courseId') as string;
    const amountStr = formData.get('amount') as string;
    if (!courseId) return;

    try {
      await studentDb.enrollInCourse(studentUid, courseId);
      
      const amount = Number(amountStr);
      if (amount && !isNaN(amount) && amount > 0) {
        const student = students.find(s => s.uid === studentUid);
        let courseName = courseId;
        formations.forEach(cat => {
          const mod = cat.modules.find(m => m.id === courseId);
          if (mod) courseName = mod.titre;
        });

        await studentDb.addPayment({
          studentId: studentUid,
          studentName: student?.fullName || "Inconnu",
          courseId: courseId,
          courseName: courseName,
          amount: amount,
          paymentMethod: "cash",
          date: new Date().toISOString()
        });
        setPayments(await studentDb.getPayments());
      }
      
      setStudents(await db.getStudents());
      alert("Étudiant inscrit" + (amount > 0 ? " et paiement enregistré" : "") + " avec succès !");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de l'inscription de l'étudiant.");
    }
  };`;

code = code.replace(oldHandleEnroll, newHandleEnroll);

// 2. Replace the UI block
const oldUiBlockRegex = /\{\/\* Manual Enrollment Selector \*\/\}[\s\S]*?(?=\{\/\* Footer Actions \*\/)/;

const newUiBlock = `{/* Manual Enrollment Selector */}
                          <div className="pt-4 border-t border-gray-150 space-y-3">
                            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Inscrire manuellement à un cours & Ajouter un paiement</h4>
                            
                            {formations.flatMap(f => f.modules.map(m => ({ id: m.id, title: m.titre, category: f.titre }))).filter(c => !selectedStudent.enrolledCourses?.includes(c.id)).length > 0 ? (
                              <form onSubmit={(e) => handleEnrollStudent(e, selectedStudent.uid)} className="space-y-3">
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Sélectionner la formation *</label>
                                  <select
                                    name="courseId"
                                    required
                                    className="w-full bg-slate-50 border border-gray-250 px-4 py-2.5 text-xs rounded-none focus:outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all text-gray-800"
                                    defaultValue=""
                                  >
                                    <option value="" disabled>Sélectionner un cours du catalogue...</option>
                                    {formations.flatMap(f => f.modules.map(m => ({ id: m.id, title: m.titre, category: f.titre })))
                                      .filter(c => !selectedStudent.enrolledCourses?.includes(c.id))
                                      .map(c => (
                                        <option key={c.id} value={c.id}>
                                          {c.title} ({c.category})
                                        </option>
                                      ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Paiement Cash (GNF) - Optionnel</label>
                                  <input
                                    type="number"
                                    name="amount"
                                    placeholder="ex: 500000"
                                    className="w-full bg-slate-50 border border-gray-250 px-4 py-2.5 text-xs rounded-none focus:outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all text-gray-800"
                                  />
                                </div>
                                <button type="submit" className="w-full py-2.5 bg-[var(--color-primary)] hover:opacity-90 text-white text-[10px] font-bold uppercase tracking-wider rounded-none transition-opacity">
                                  Inscrire & Enregistrer Paiement
                                </button>
                              </form>
                            ) : (
                              <p className="text-xs text-green-700 bg-green-50/50 p-4 rounded-none border border-green-150/40">
                                L'étudiant est déjà inscrit à l'intégralité du catalogue.
                              </p>
                            )}
                          </div>
                        </div>

                        `;

code = code.replace(oldUiBlockRegex, newUiBlock);

fs.writeFileSync('app/(admin)/admin/page.tsx', code);
console.log('Done replacement');
