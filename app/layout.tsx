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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "https://produto-pronto.vercel.app"),
  title: "Produto Pronto",
  description: "Transforme seu conhecimento em um produto digital.",
  icons: {
    icon: [
      { url: "/brand/favicon-16.png", sizes: "1536x1024", type: "image/png" },
      { url: "/brand/favicon-32.png", sizes: "1536x1024", type: "image/png" },
      { url: "/brand/favicon-64.png", sizes: "1536x1024", type: "image/png" },
      { url: "/brand/favicon-512.png", sizes: "1536x1024", type: "image/png" },
    ],
    apple: [{ url: "/brand/app-icon.png", sizes: "1536x1024", type: "image/png" }],
  },
  openGraph: {
    title: "Produto Pronto",
    description: "Transforme seu conhecimento em um produto digital.",
    images: [{ url: "/brand/og-image.png", width: 1729, height: 910, alt: "Produto Pronto" }],
    siteName: "Produto Pronto",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
