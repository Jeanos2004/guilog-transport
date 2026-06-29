"use client";

import { useState, useEffect } from "react";
import { StudentCourse } from "@/lib/studentDb";
import { motion, AnimatePresence } from "framer-motion";
import { X, CreditCard, Smartphone, CheckCircle, RefreshCw, ChevronRight } from "lucide-react";
import { auth } from "@/lib/firebase";


interface PaymentModalProps {
  course: StudentCourse;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type PaymentMethod = "om" | "momo" | "card";
type PaymentStep = "method" | "details" | "otp" | "success";

export default function PaymentModal({ course, isOpen, onClose, onSuccess }: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethod>("om");
  const [step, setStep] = useState<PaymentStep>("method");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(15);
  const [transactionId, setTransactionId] = useState("");
  const [polling, setPolling] = useState(false);

  useEffect(() => {
    if (step === "otp" && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, countdown]);

  useEffect(() => {
    let interval: any;
    if (polling && transactionId && step === "otp") {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/djomy/status?transactionId=${transactionId}`);
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


  if (!isOpen) return null;

  
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
        const res = await fetch(`/api/djomy/status?transactionId=${transactionId}`);
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


  const handleFinish = () => {
    onSuccess();
    onClose();
    // reset state
    setStep("method");
    setPhone("");
    setOtp("");
  };

  // Format currency (GNF)
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "GNF", maximumFractionDigits: 0 })
      .format(price)
      .replace("GNF", "FG");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm font-sans">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white w-full max-w-md rounded-none shadow-sm border border-gray-200 overflow-hidden text-gray-800"
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[var(--color-primary)]">Finaliser l'inscription</h3>
            <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5 truncate max-w-[280px]">{course.title}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {step === "method" && (
              <motion.div
                key="step-method"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                <div className="p-4 bg-[var(--color-primary)]/5 border border-slate-200 rounded-none flex justify-between items-center shadow-sm">
                  <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-primary)]">Montant à régler :</span>
                  <span className="text-lg font-black text-[var(--color-accent)]">{formatPrice(course.price)}</span>
                </div>

                <div className="space-y-2.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500">Moyen de paiement</label>
                  
                  <button
                    onClick={() => setMethod("om")}
                    className={`w-full p-4 border rounded-none flex items-center justify-between transition-all ${
                      method === "om" ? "border-orange-500 bg-orange-50 text-orange-955 shadow-sm" : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-none border border-orange-600 bg-orange-500 text-white flex items-center justify-center font-bold">OM</div>
                      <div className="text-left">
                        <p className="text-xs font-bold">Orange Money Guinée</p>
                        <p className="text-[10px] text-gray-450">Paiement mobile instantané</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>

                  <button
                    onClick={() => setMethod("momo")}
                    className={`w-full p-4 border rounded-none flex items-center justify-between transition-all ${
                      method === "momo" ? "border-yellow-600 bg-yellow-50 text-yellow-955 shadow-sm" : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-none border border-yellow-600 bg-yellow-500 text-yellow-950 flex items-center justify-center font-black">MTN</div>
                      <div className="text-left">
                        <p className="text-xs font-bold">MTN Mobile Money</p>
                        <p className="text-[10px] text-gray-455">Paiement mobile instantané</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>

                  <button
                    onClick={() => setMethod("card")}
                    className={`w-full p-4 border rounded-none flex items-center justify-between transition-all ${
                      method === "card" ? "border-blue-600 bg-blue-50 text-blue-955 shadow-sm" : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-none border border-blue-700 bg-blue-600 text-white flex items-center justify-center"><CreditCard className="w-5 h-5" /></div>
                      <div className="text-left">
                        <p className="text-xs font-bold">Carte Bancaire</p>
                        <p className="text-[10px] text-gray-450">Visa / Mastercard / UnionPay</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === "details" && (
              <motion.div
                key="step-details"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-4"
              >
                {method === "card" ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Nom sur la carte</label>
                      <input
                        type="text" required
                        className="w-full bg-gray-50 border border-gray-300 px-3.5 py-2.5 text-xs rounded-none focus:outline-none focus:border-blue-500 shadow-sm"
                        placeholder="Moussa Diallo"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Numéro de carte</label>
                      <input
                        type="text" required
                        className="w-full bg-gray-50 border border-gray-300 px-3.5 py-2.5 text-xs rounded-none focus:outline-none focus:border-blue-500 shadow-sm"
                        placeholder="4000 1234 5678 9010"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">Expiration</label>
                        <input
                          type="text" required
                          className="w-full bg-gray-50 border border-gray-300 px-3.5 py-2.5 text-xs rounded-none focus:outline-none focus:border-blue-500 shadow-[2px_2px_0px_0px_var(--color-primary)]"
                          placeholder="MM/AA"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1">CVC / CVV</label>
                        <input
                          type="text" required
                          className="w-full bg-gray-50 border border-gray-300 px-3.5 py-2.5 text-xs rounded-none focus:outline-none focus:border-blue-500 shadow-[2px_2px_0px_0px_var(--color-primary)]"
                          placeholder="123"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-none flex items-center gap-3 shadow-sm">
                      <Smartphone className="w-8 h-8 text-[var(--color-primary)]" />
                      <div>
                        <h4 className="text-xs font-bold">Paiement Mobile</h4>
                        <p className="text-[10px] text-gray-400">Entrez votre numéro pour lancer la transaction.</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-1.5">Numéro de Téléphone {method === "om" ? "Orange" : "MTN"} *</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">+224</span>
                        <input
                          type="tel"
                          required
                          className="w-full bg-gray-50 border border-gray-300 pl-14 pr-4 py-3 text-xs font-bold rounded-none focus:outline-none focus:border-[var(--color-primary)] shadow-sm"
                          placeholder="622 00 00 00"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {step === "otp" && (
              <motion.div
                key="step-otp"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="text-center space-y-5 py-6"
              >
                <div className="w-14 h-14 rounded-none bg-orange-50 border border-orange-200 text-orange-600 flex items-center justify-center mx-auto animate-pulse">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-550">Validation en cours...</h4>
                  <p className="text-xs text-gray-700 mt-2 max-w-xs mx-auto">
                    Une demande de paiement a été envoyée sur le mobile **+224 {phone}**.
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">
                    Veuillez composer {method === "om" ? "*144*4*2#" : "*156#"} sur votre téléphone pour approuver le retrait.
                  </p>
                </div>

                
                <div className="w-4/5 mx-auto p-4 rounded-none">
                  <p className="text-xs text-gray-500 font-bold mb-2">En attente de confirmation sur votre téléphone...</p>
                  <div className="text-[10px] text-gray-405 mt-2">
                    Expiration dans <span className="font-bold text-red-500">{countdown}s</span>
                  </div>
                </div>

              </motion.div>
            )}

            {step === "success" && (
              <motion.div
                key="step-success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center space-y-5 py-8"
              >
                <div className="w-16 h-16 rounded-none bg-green-50 border border-green-200 text-green-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-sm font-black text-gray-800 leading-tight">Félicitations !</h4>
                  <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed">
                    Votre paiement de **{formatPrice(course.price)}** a été validé avec succès. Votre cours est désormais débloqué !
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer actions */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50 flex items-center justify-between">
          {step === "method" && (
            <>
              <button onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700">
                Annuler
              </button>
              <button onClick={handleNext} className="px-5 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-wider rounded-none border border-[var(--color-primary)] transition-all shadow-sm hover:shadow-md">
                Continuer
              </button>
            </>
          )}

          {step === "details" && (
            <>
              <button onClick={() => setStep("method")} className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700">
                Retour
              </button>
              <button
                onClick={handleNext}
                disabled={loading || (method !== "card" && !phone)}
                className="px-5 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-wider rounded-none border border-[var(--color-primary)] transition-all shadow-[2px_2px_0px_0px_var(--color-accent)] disabled:opacity-50 flex items-center gap-1.5"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Payer {formatPrice(course.price)}</span>
                )}
              </button>
            </>
          )}

          {step === "otp" && (
            <>
              <button onClick={() => setStep("details")} className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700">
                Retour
              </button>
              <button
                onClick={handleNext}
                disabled={loading || !otp}
                className="px-5 py-2.5 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-wider rounded-none border border-[var(--color-primary)] transition-all shadow-[2px_2px_0px_0px_var(--color-accent)] disabled:opacity-50 flex items-center gap-1.5"
              >
                {loading ? (
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <span>Vérifier le statut</span>
                )}
              </button>
            </>
          )}

          {step === "success" && (
            <button onClick={handleFinish} className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-accent)] text-white text-xs font-bold uppercase tracking-wider rounded-none border border-[var(--color-primary)] transition-all shadow-sm hover:shadow-md">
              Accéder à mes cours
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
