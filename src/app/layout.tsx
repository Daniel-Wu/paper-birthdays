import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MainLayout } from "@/components/layout";

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
    default: "Paper Birthdays - Discover Historic Academic Papers",
    template: "%s | Paper Birthdays"
  },
  description: "Discover historically significant academic papers published on this day in previous years. Explore groundbreaking research from arXiv with citation data from Semantic Scholar.",
  keywords: [
    "academic papers",
    "arxiv",
    "research papers",
    "scientific research",
    "citations",
    "semantic scholar",
    "academic history",
    "research discovery",
    "scientific papers",
    "paper recommendations",
    "daily papers",
    "research trends"
  ],
  authors: [{ name: "Paper Birthdays Team" }],
  creator: "Paper Birthdays",
  publisher: "Paper Birthdays",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://paperbirthdays.com",
    siteName: "Paper Birthdays",
    title: "Paper Birthdays - Discover Historic Academic Papers",
    description: "Discover historically significant academic papers published on this day in previous years. Explore groundbreaking research from arXiv with citation data from Semantic Scholar.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Paper Birthdays - Discover Historic Academic Papers",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@paperbirthdays",
    creator: "@paperbirthdays",
    title: "Paper Birthdays - Discover Historic Academic Papers",
    description: "Discover historically significant academic papers published on this day in previous years.",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#0ea5e9",
      },
    ],
  },
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : new URL("https://paperbirthdays.com"),
  alternates: {
    canonical: "/",
  },
  category: "education",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0ea5e9" },
    { media: "(prefers-color-scheme: dark)", color: "#0ea5e9" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MainLayout>
          {children}
        </MainLayout>
      </body>
    </html>
  );
}
