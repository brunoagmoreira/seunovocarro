import type { Metadata, Viewport } from "next";
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

const siteUrl =
  (process.env.NEXT_PUBLIC_SITE_URL || "https://seunovocarro.com.br").replace(
    /\/$/,
    "",
  );

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: "Seu Novo Carro",
  title: {
    default: "Seu Novo Carro | O Seu Próximo Carro Está Aqui",
    template: "%s | Seu Novo Carro",
  },
  description:
    "Encontre as melhores ofertas de carros novos e seminovos no portal Seu Novo Carro. Qualidade, segurança e o melhor preço.",
  keywords: [
    "carros",
    "seminovos",
    "venda de carros",
    "seu novo carro",
    "veículos",
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Seu Novo Carro",
  },
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  openGraph: {
    type: "website",
    locale: "pt_BR",
    siteName: "Seu Novo Carro",
    url: siteUrl,
  },
  twitter: {
    card: "summary_large_image",
    title: "Seu Novo Carro",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#268052" },
    { media: "(prefers-color-scheme: dark)", color: "#268052" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  colorScheme: "light dark",
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
      <body className="min-h-dvh min-h-[100dvh] flex flex-col touch-manipulation">
        <Providers>
          <TenantThemeProvider>{children}</TenantThemeProvider>
        </Providers>
      </body>
    </html>
  );
}
