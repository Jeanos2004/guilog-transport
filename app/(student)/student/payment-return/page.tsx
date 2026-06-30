"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function PaymentReturnContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const transactionId = searchParams.get("transactionId");
  const status = searchParams.get("status");

  const [verifying, setVerifying] = useState(true);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (status === "SUCCESS") {
      setSuccess(true);
      setVerifying(false);
    } else if (transactionId && status !== "FAILED") {
      // Poll to check status if not explicitly failed but not success yet
      fetch(`/api/djomy/status?transactionId=${transactionId}`)
        .then(res => res.json())
        .then(data => {
          if (data.status === "SUCCESS") {
            setSuccess(true);
          } else {
            setSuccess(false);
          }
          setVerifying(false);
        })
        .catch(() => {
          setSuccess(false);
          setVerifying(false);
        });
    } else {
      setSuccess(false);
      setVerifying(false);
    }
  }, [transactionId, status]);

  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-12 h-12 text-[var(--color-primary)] animate-spin" />
        <h2 className="text-lg font-bold text-gray-800">Vérification du paiement...</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-md mx-auto text-center px-4">
      {success ? (
        <>
          <CheckCircle className="w-16 h-16 text-emerald-500 mb-6 shadow-sm rounded-full" />
          <h1 className="text-2xl font-black text-gray-900 mb-3">Paiement Validé !</h1>
          <p className="text-sm text-gray-600 mb-8 leading-relaxed">
            Votre inscription a été confirmée avec succès. Vous pouvez maintenant accéder à votre cours depuis votre tableau de bord.
          </p>
          <Link href="/student/dashboard" className="px-6 py-3 bg-[var(--color-primary)] text-white text-xs font-bold uppercase tracking-wider hover:bg-[var(--color-accent)] transition-colors w-full sm:w-auto">
            Accéder à mes cours
          </Link>
        </>
      ) : (
        <>
          <XCircle className="w-16 h-16 text-red-500 mb-6 shadow-sm rounded-full" />
          <h1 className="text-2xl font-black text-gray-900 mb-3">Échec du paiement</h1>
          <p className="text-sm text-gray-600 mb-8 leading-relaxed">
            Nous n'avons pas pu valider votre transaction. Veuillez réessayer ou contacter le support.
          </p>
          <Link href="/student/catalog" className="px-6 py-3 border border-gray-300 text-gray-700 text-xs font-bold uppercase tracking-wider hover:bg-gray-50 transition-colors w-full sm:w-auto">
            Retour au catalogue
          </Link>
        </>
      )}
    </div>
  );
}

export default function PaymentReturnPage() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Fallback simple header for this specific page */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="font-heading font-black text-xl tracking-tight text-[var(--color-primary)]">
          Guilogtrans<span className="text-[var(--color-accent)]">.</span>
        </div>
      </div>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
        </div>
      }>
        <PaymentReturnContent />
      </Suspense>
    </div>
  );
}
