import type { Metadata } from "next";
import { Playfair_Display, DM_Sans, Space_Grotesk } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: 'Cabinet Guilogtrans — Conseil, Étude & Formation en Logistique et Transport | Conakry, Guinée',
    template: '%s | Guilogtrans'
  },
  description: 'Cabinet de conseil, d\'étude et de formation spécialisé en logistique et transport à Conakry, Guinée. Disponibilité · Efficacité · Flexibilité.',
  keywords: ['logistique Guinée', 'formation transport Conakry', 'cabinet logistique Guinée', 'supply chain Afrique de l\'Ouest', 'Guilogtrans'],
  openGraph: {
    type: 'website',
    locale: 'fr_GN',
    url: 'https://guilogtrans.com',
    siteName: 'Cabinet Guilogtrans',
  }
};

/**
 * Root layout minimal — délègue tout aux layouts enfants.
 * Fournit uniquement le HTML shell, les polices et le CSS global.
 */
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="fr"
      className={`${playfair.variable} ${dmSans.variable} ${spaceGrotesk.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
