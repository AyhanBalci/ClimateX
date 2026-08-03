import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { SettingsProvider } from "@/components/agents/providers/SettingsProvider";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-agentdisplay",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Agent Center",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AgentsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className={`agents-shell min-h-screen ${spaceGrotesk.variable}`}>
      <SettingsProvider>{children}</SettingsProvider>
    </div>
  );
}
