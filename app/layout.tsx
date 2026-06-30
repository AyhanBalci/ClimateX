import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "ClimateX | Laadpaal Installateur Nederland",
    template: "%s | ClimateX",
  },
  description:
    "Laadpaal installeren voor thuis, zakelijk of VvE. Slimme laadpalen met load balancing van Alfen, Zaptec, Easee en meer. Vraag direct een gratis offerte aan bij ClimateX.",
  keywords: [
    "laadpaal installeren",
    "laadpaal thuis",
    "zakelijke laadpaal",
    "laadpaal installateur",
    "EV charger",
    "elektrisch laden",
    "slimme laadpaal",
    "load balancing",
    "dynamic load balancing",
    "VvE laadpalen",
  ],
  openGraph: {
    title: "ClimateX | Laadpaal Installateur Nederland",
    description:
      "Premium laadpalen voor thuis, zakelijk en VvE. Vakkundig geïnstalleerd met load balancing als standaard.",
    locale: "nl_NL",
    type: "website",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
