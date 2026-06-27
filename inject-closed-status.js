const fs = require('fs');

function injectBadge(filePath) {
    let code = fs.readFileSync(filePath, 'utf-8');
    
    // Add badge to the card
    const badgeHTML = `
                      <div className="absolute top-4 left-4 z-10 flex gap-2">
                        <span className="bg-white/90 backdrop-blur-sm text-[var(--color-primary)] text-[10px] font-bold px-2 py-1 uppercase tracking-wider shadow-sm">
                          {mod.categorie}
                        </span>
                        {mod.details?.statutInscription === "Fermée" && (
                          <span className="bg-red-500/90 backdrop-blur-sm text-white text-[10px] font-bold px-2 py-1 uppercase tracking-wider shadow-sm">
                            Fermée
                          </span>
                        )}
                      </div>
    `;

    // Replace old category badge with the new multiple badges
    const oldBadgeRegex = /<span className="absolute top-4 left-4 z-10 bg-white\/90 backdrop-blur-sm text-\[var\(--color-primary\)\] text-\[10px\] font-bold px-2 py-1 uppercase tracking-wider shadow-sm">\s*\{mod\.categorie\}\s*<\/span>/;
    
    if (code.match(oldBadgeRegex)) {
        code = code.replace(oldBadgeRegex, badgeHTML);
        console.log("Injected badge in " + filePath);
    }

    // Disable "S'inscrire" or "Voir les détails" if we want, but usually it's best to let them click and see it's closed on the details page.
    fs.writeFileSync(filePath, code);
}

try {
    injectBadge('app/(marketing)/formations/page.tsx');
    injectBadge('app/(student)/student/catalog/page.tsx');
} catch (e) {
    console.error("Error modifying catalogs:", e);
}

// Now modify the details page (app/(marketing)/formations/[slug]/page.tsx)
try {
    let detailCode = fs.readFileSync('app/(marketing)/formations/[slug]/page.tsx', 'utf-8');
    
    // Replace the specific hardcoded <button> that triggers registration modal with a conditional one
    const fullButtonBlock = `<button onClick={() => setIsModalOpen(true)} className="w-full bg-[var(--color-primary)] hover:bg-[#3b34c2] text-white font-bold py-3.5 px-6 rounded-none transition-colors uppercase text-sm tracking-wider flex items-center justify-center gap-2">
                    S'inscrire maintenant
                    <ArrowRight className="w-4 h-4" />
                  </button>`;
    
    const replacementBlock = `
                  {details.statutInscription === "Fermée" ? (
                    <button disabled className="w-full bg-gray-300 text-gray-500 font-bold py-3.5 px-6 rounded-none uppercase text-sm tracking-wider flex items-center justify-center gap-2 cursor-not-allowed">
                      <Lock className="w-4 h-4" /> Inscriptions Fermées
                    </button>
                  ) : (
                    <button onClick={() => setIsModalOpen(true)} className="w-full bg-[var(--color-primary)] hover:bg-[#3b34c2] text-white font-bold py-3.5 px-6 rounded-none transition-colors uppercase text-sm tracking-wider flex items-center justify-center gap-2">
                      S'inscrire maintenant
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
    `;

    if (detailCode.includes(fullButtonBlock)) {
        detailCode = detailCode.replace(fullButtonBlock, replacementBlock);
        
        // Ensure Lucide icon Lock is imported
        if (!detailCode.includes('Lock,')) {
            detailCode = detailCode.replace(/import {/, 'import { Lock,');
        }
        
        fs.writeFileSync('app/(marketing)/formations/[slug]/page.tsx', detailCode);
        console.log("Injected closed button logic in details page");
    }

} catch (e) {
    console.error("Error modifying details page:", e);
}
