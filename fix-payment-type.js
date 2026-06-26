const fs = require('fs');
let code = fs.readFileSync('app/(admin)/admin/page.tsx', 'utf-8');

// Update partial payment form
const partialPaymentRegex = /<form onSubmit=\{async \(e\) => \{[\s\S]*?className="flex gap-2">\s*<input[\s\S]*?name="amount"[\s\S]*?\/>\s*<button[\s\S]*?>/;

const replacementPartial = `<form onSubmit={async (e) => {
                                          e.preventDefault();
                                          const form = e.currentTarget;
                                          const formData = new FormData(form);
                                          const amount = Number(formData.get('amount'));
                                          const paymentType = formData.get('paymentType') as string;
                                          if (amount > 0) {
                                            try {
                                              await studentDb.addPayment({
                                                studentId: selectedStudent.uid,
                                                studentName: selectedStudent.fullName,
                                                courseId: courseId,
                                                courseName: matchedCourse.title,
                                                amount: amount,
                                                paymentMethod: "cash",
                                                paymentType: paymentType || "tranche",
                                                date: new Date().toISOString()
                                              });
                                              const newPayments = await studentDb.getPayments();
                                              setPayments(newPayments);
                                              
                                              alert("Nouveau versement enregistré avec succès !");
                                              form.reset();
                                            } catch (err) {
                                              console.error(err);
                                              alert("Erreur lors de l'enregistrement du paiement.");
                                            }
                                          }
                                        }} className="flex flex-col sm:flex-row gap-2">
                                          <div className="flex-grow flex gap-2">
                                            <select name="paymentType" className="bg-slate-50 border border-gray-250 px-2 py-1.5 text-[10px] rounded-none focus:outline-none focus:border-[var(--color-primary)] transition-all">
                                              <option value="tranche">Par tranche</option>
                                              <option value="integral">Intégral (Solde)</option>
                                            </select>
                                            <input 
                                              type="number" 
                                              name="amount" 
                                              placeholder="Montant (GNF)" 
                                              required 
                                              className="w-full bg-slate-50 border border-gray-250 px-2 py-1.5 text-[10px] rounded-none focus:outline-none focus:border-[var(--color-primary)] transition-all" 
                                            />
                                          </div>
                                          <button 
                                            type="submit" 
                                            className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-[9px] font-bold uppercase tracking-wider rounded-none transition-colors whitespace-nowrap"
                                          >`;

code = code.replace(partialPaymentRegex, replacementPartial);

// Update manual enrollment form
const manualEnrollFormRegex = /<label className="block text-\[10px\] font-bold text-gray-500 uppercase tracking-wider mb-1">Paiement Cash \(GNF\) - Optionnel<\/label>[\s\S]*?<button type="submit" className="w-full py-2\.5 bg-\[var\(--color-primary\)\]/;

const manualEnrollReplacement = `<label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Paiement Cash (GNF) - Optionnel</label>
                                  <div className="flex gap-2">
                                    <select name="paymentType" className="bg-slate-50 border border-gray-250 px-3 py-2.5 text-xs rounded-none focus:outline-none focus:border-[var(--color-primary)] transition-all">
                                      <option value="integral">Intégral</option>
                                      <option value="tranche">1ère tranche</option>
                                    </select>
                                    <input
                                      type="number"
                                      name="amount"
                                      placeholder="ex: 500000"
                                      className="w-full bg-slate-50 border border-gray-250 px-4 py-2.5 text-xs rounded-none focus:outline-none focus:border-[var(--color-primary)] focus:bg-white transition-all text-gray-800"
                                    />
                                  </div>
                                </div>
                                <button type="submit" className="w-full py-2.5 bg-[var(--color-primary)]`;

code = code.replace(manualEnrollFormRegex, manualEnrollReplacement);


// Update handleEnrollStudent to accept paymentType
const handleEnrollRegex = /const amountStr = formData\.get\('amount'\) as string;[\s\S]*?paymentMethod: "cash",[\s\S]*?date: new Date\(\)\.toISOString\(\)/;

const handleEnrollReplacement = `const amountStr = formData.get('amount') as string;
    const paymentType = formData.get('paymentType') as string;
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
          paymentType: paymentType || "integral",
          date: new Date().toISOString()`;

code = code.replace(handleEnrollRegex, handleEnrollReplacement);


fs.writeFileSync('app/(admin)/admin/page.tsx', code);
console.log('Payment types added');
