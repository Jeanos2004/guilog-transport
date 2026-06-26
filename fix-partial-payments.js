const fs = require('fs');
let code = fs.readFileSync('app/(admin)/admin/page.tsx', 'utf-8');

const oldRegex = /\{\/\* Enrolled Courses and Progress \*\/\}[\s\S]*?(?=\{\/\* Manual Enrollment Selector \*\/)/;

const newBlock = `{/* Enrolled Courses and Progress */}
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Formations & Progression</h4>
                            
                            {selectedStudent.enrolledCourses && selectedStudent.enrolledCourses.length > 0 ? (
                              <div className="space-y-3">
                                {selectedStudent.enrolledCourses.map((courseId) => {
                                  const matchedCourse = formations.flatMap(f => f.modules.map(m => ({ id: m.id, title: m.titre, category: f.titre, sessions: m.sessions }))).find(c => c.id === courseId);
                                  if (!matchedCourse) return null;
  
                                  // Calculate progress
                                  let totalLectures = matchedCourse.sessions?.length || 0;
                                  const completedCount = selectedStudent.progress?.[courseId]?.length || 0;
                                  const progressPct = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;
  
                                  // Calculate payments
                                  const coursePayments = payments.filter(p => p.studentId === selectedStudent.uid && p.courseId === courseId);
                                  const totalPaid = coursePayments.reduce((acc, p) => acc + (p.amount || 0), 0);

                                  return (
                                    <div key={courseId} className="p-4 bg-white border border-gray-150 rounded-none space-y-3 shadow-sm">
                                      <div className="flex justify-between items-start">
                                        <div>
                                          <h5 className="text-xs font-extrabold text-gray-900 leading-snug">{matchedCourse.title}</h5>
                                          <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{matchedCourse.category}</span>
                                        </div>
                                        <span className={\`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider \${
                                          progressPct === 100 
                                            ? "bg-green-50 text-green-700 border border-green-150" 
                                            : "bg-blue-50 text-blue-700 border border-blue-150"
                                        }\`}>
                                          {progressPct === 100 ? "Validé ✅" : "En cours"}
                                        </span>
                                      </div>
  
                                      {/* Progress indicator */}
                                      <div className="space-y-1.5">
                                        <div className="flex justify-between items-center text-[9px] font-bold text-gray-400">
                                          <span>Leçons validées : {completedCount} / {totalLectures}</span>
                                          <span className="text-blue-600">{progressPct}%</span>
                                        </div>
                                        <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                          <div 
                                            className={\`h-full rounded-full transition-all duration-300 \${
                                              progressPct === 100 ? "bg-green-500" : "bg-blue-600"
                                            }\`} 
                                            style={{ width: \`\${progressPct}%\` }} 
                                          />
                                        </div>
                                      </div>

                                      {/* Payment section */}
                                      <div className="pt-3 border-t border-gray-100">
                                        <div className="flex justify-between items-center mb-2">
                                          <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Total versé:</span>
                                          <span className="text-xs font-black text-green-700">{totalPaid.toLocaleString()} GNF</span>
                                        </div>
                                        
                                        <form onSubmit={async (e) => {
                                          e.preventDefault();
                                          const form = e.currentTarget;
                                          const formData = new FormData(form);
                                          const amount = Number(formData.get('amount'));
                                          if (amount > 0) {
                                            try {
                                              await studentDb.addPayment({
                                                studentId: selectedStudent.uid,
                                                studentName: selectedStudent.fullName,
                                                courseId: courseId,
                                                courseName: matchedCourse.title,
                                                amount: amount,
                                                paymentMethod: "cash",
                                                date: new Date().toISOString()
                                              });
                                              // Force refresh payments to update sum
                                              const newPayments = await studentDb.getPayments();
                                              setPayments(newPayments);
                                              
                                              alert("Nouveau versement enregistré avec succès !");
                                              form.reset();
                                            } catch (err) {
                                              console.error(err);
                                              alert("Erreur lors de l'enregistrement du paiement.");
                                            }
                                          }
                                        }} className="flex gap-2">
                                          <input 
                                            type="number" 
                                            name="amount" 
                                            placeholder="Montant (GNF)" 
                                            required 
                                            className="w-full bg-slate-50 border border-gray-250 px-2 py-1.5 text-[10px] rounded-none focus:outline-none focus:border-[var(--color-primary)] transition-all" 
                                          />
                                          <button 
                                            type="submit" 
                                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[9px] font-bold uppercase tracking-wider rounded-none transition-colors whitespace-nowrap"
                                          >
                                            Verser
                                          </button>
                                        </form>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <p className="text-xs text-gray-500 bg-gray-50 p-4 rounded-none border border-gray-150">
                                Aucune formation en cours.
                              </p>
                            )}
                          </div>

                          `;

code = code.replace(oldRegex, newBlock);
fs.writeFileSync('app/(admin)/admin/page.tsx', code);
console.log('Payment chunk script complete.');
