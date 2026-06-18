import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Sonic ChatBot",
  description: "Converse com o Sonic The Hedgehog usando inteligência artificial.",
  icons: { icon: "/logo.png" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
