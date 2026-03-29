import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { TenantThemeProvider } from "@/components/providers/TenantThemeProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Seu Novo Carro | O Seu Próximo Carro Está Aqui",
  description: "Encontre as melhores ofertas de carros novos e seminovos no portal Seu Novo Carro. Qualidade, segurança e o melhor preço.",
  keywords: ["carros", "seminovos", "venda de carros", "seu novo carro", "veículos"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <TenantThemeProvider>
            {children}
          </TenantThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
