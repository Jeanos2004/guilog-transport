const fs = require('fs');

let code = fs.readFileSync('components/student/PaymentModal.tsx', 'utf-8');

// We need to inject user auth from firebase into PaymentModal if it's not there, so we can pass userId
const userImport = `import { auth } from "@/lib/firebase";\n`;
if (!code.includes('import { auth }')) {
    code = code.replace(/import \{ X, CreditCard, Smartphone, CheckCircle, RefreshCw, ChevronRight \} from "lucide-react";/, "import { X, CreditCard, Smartphone, CheckCircle, RefreshCw, ChevronRight } from \"lucide-react\";\n" + userImport);
}

// Add state for transactionId
if (!code.includes('const [transactionId, setTransactionId] = useState("");')) {
    code = code.replace(/const \[countdown, setCountdown\] = useState\(15\);/, 'const [countdown, setCountdown] = useState(15);\n  const [transactionId, setTransactionId] = useState("");\n  const [polling, setPolling] = useState(false);');
}

// Rewrite handleNext
const handleNextRegex = /const handleNext = \(\) => \{[\s\S]*?\};/;
const newHandleNext = `
  const handleNext = async () => {
    if (step === "method") {
      setStep("details");
    } else if (step === "details") {
      setLoading(true);
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("Vous devez être connecté");

        const res = await fetch('/api/djomy/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentMethod: method,
            amount: course.price,
            phone: phone,
            courseId: course.id,
            userId: currentUser.uid
          })
        });

        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.error || "Erreur de paiement");
        }

        if (method === "card") {
          // Redirect for Card Gateway Payment
          if (data.redirectUrl) {
            window.location.href = data.redirectUrl;
          } else {
            throw new Error("Lien de paiement introuvable");
          }
        } else {
          // Direct Payment for OM/MOMO
          if (!phone) return;
          setTransactionId(data.transactionId); // Assuming Djomy returns transactionId
          setStep("otp");
          setCountdown(120); // 2 minutes for mobile money
          setPolling(true);
        }
      } catch (err: any) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    } else if (step === "otp") {
      setLoading(true);
      // Wait for webhook or polling to finish
      // For now we just let the polling handle success, but we can manually check status
      try {
        const res = await fetch(\`/api/djomy/status?transactionId=\${transactionId}\`);
        const data = await res.json();
        if (data.status === "SUCCESS") {
          setPolling(false);
          setLoading(false);
          setStep("success");
          onSuccess(); // call to enroll in UI
        } else if (data.status === "FAILED") {
          alert("Le paiement a échoué.");
          setLoading(false);
          setStep("method");
        } else {
          alert("Paiement toujours en attente...");
          setLoading(false);
        }
      } catch (err) {
        setLoading(false);
      }
    }
  };
`;

code = code.replace(handleNextRegex, newHandleNext);

// Add Polling useEffect
const pollingEffect = `
  useEffect(() => {
    let interval: any;
    if (polling && transactionId && step === "otp") {
      interval = setInterval(async () => {
        try {
          const res = await fetch(\`/api/djomy/status?transactionId=\${transactionId}\`);
          const data = await res.json();
          if (data.status === "SUCCESS") {
            setPolling(false);
            setStep("success");
            onSuccess(); // Call success
          } else if (data.status === "FAILED") {
            setPolling(false);
            alert("Le paiement a été refusé ou a échoué.");
            setStep("method");
          }
        } catch (e) {
          console.error(e);
        }
      }, 5000); // poll every 5s
    }
    return () => clearInterval(interval);
  }, [polling, transactionId, step, onSuccess]);
`;

if (!code.includes('interval = setInterval')) {
    code = code.replace(/useEffect\(\(\) => \{[\s\S]*?return \(\) => clearTimeout\(timer\);\s*\}\s*\}, \[step, countdown\]\);/, match => match + '\n' + pollingEffect);
}

// Modify OTP UI slightly since the OTP is handled by the carrier for direct API
// Djomy API says OM and MOMO notify the payer by SMS/App. So we don't need to ask them to type OTP in our UI!
const otpUIRegex = /<div className="w-4\/5 mx-auto bg-gray-50 border border-gray-200 p-4 rounded-none shadow-sm">[\s\S]*?<\/div>\s*<\/div>/;
const otpUIRemoval = `
                <div className="w-4/5 mx-auto p-4 rounded-none">
                  <p className="text-xs text-gray-500 font-bold mb-2">En attente de confirmation sur votre téléphone...</p>
                  <div className="text-[10px] text-gray-405 mt-2">
                    Expiration dans <span className="font-bold text-red-500">{countdown}s</span>
                  </div>
                </div>
`;
code = code.replace(otpUIRegex, otpUIRemoval);

const validateBtnRegex = /<span>Valider le code<\/span>/;
code = code.replace(validateBtnRegex, '<span>Vérifier le statut</span>');

fs.writeFileSync('components/student/PaymentModal.tsx', code);
console.log('PaymentModal modified successfully');
