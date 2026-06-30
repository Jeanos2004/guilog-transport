export function formatGuineaPhone(phone: string): string {
  // Supprimer tous les espaces, tirets, etc.
  let cleaned = phone.replace(/[^0-9+]/g, "");
  
  // Si ça commence par +224, enlever
  if (cleaned.startsWith("+224")) {
    cleaned = cleaned.substring(4);
  }
  // Si ça commence par 224 suivi d'un 6 (ex: 224612345678), on suppose que le 224 est l'indicatif
  else if (cleaned.startsWith("224") && cleaned.length === 12) {
    cleaned = cleaned.substring(3);
  }
  
  // À ce stade, on devrait avoir un numéro de 9 chiffres commençant par 6
  if (cleaned.length === 9 && cleaned.startsWith("6")) {
    return cleaned;
  }
  
  return ""; // Invalide
}

export async function sendSingleSms(contact: string, message: string) {
  const apiKey = process.env.PASSEINFO_API_KEY;
  const clientId = process.env.PASSEINFO_CLIENT_ID;
  const senderName = process.env.PASSEINFO_SENDER_NAME || "Guilogtrans-GUINEE";

  if (!apiKey || !clientId) {
    throw new Error("Clés API PASSEINFO manquantes.");
  }

  const formattedPhone = formatGuineaPhone(contact);
  if (!formattedPhone) {
    throw new Error("Numéro de téléphone invalide. Il doit être un numéro guinéen valide.");
  }

  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "api-key": apiKey,
      "client-id": clientId,
    },
    body: JSON.stringify({
      message: message,
      contact: formattedPhone,
      senderName: senderName,
    }),
  };

  const response = await fetch("https://api.passeinfo.com/v1/message/single_message", options);
  
  const data = await response.json().catch(() => null);
  
  if (!response.ok) {
    throw new Error(data?.message || `Erreur lors de l'envoi du SMS (Code: ${response.status})`);
  }
  
  return data;
}

export async function getSmsBalance() {
  const apiKey = process.env.PASSEINFO_API_KEY;
  const clientId = process.env.PASSEINFO_CLIENT_ID;

  if (!apiKey || !clientId) {
    throw new Error("Clés API PASSEINFO manquantes.");
  }

  const options = {
    method: "GET",
    headers: {
      "api-key": apiKey,
      "client-id": clientId,
    },
  };

  const response = await fetch("https://api.passeinfo.com/v1/user/get_solde", options);
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.message || `Erreur lors de la récupération du solde (Code: ${response.status})`);
  }

  return data;
}
