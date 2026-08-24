import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lumina - Focus & Grow",
  description: "Lumina is a next-generation Pomodoro platform featuring virtual study rooms, ambient sounds, and task management. Boost your productivity today.",
  keywords: ["pomodoro timer", "focus app", "virtual study room", "productivity", "time management", "ambient mixer", "Lumina"],
  authors: [{ name: "Lumina Team" }],
  creator: "Lumina",
  publisher: "Lumina",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Lumina - Focus & Grow",
    description: "Boost your productivity with Lumina's immersive Pomodoro timer and virtual study rooms.",
    url: "https://lumina-focus.app",
    siteName: "Lumina",
    images: [
      {
        url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop", // placeholder SEO image
        width: 1200,
        height: 630,
        alt: "Lumina Focus App Preview",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Lumina - Focus & Grow",
    description: "Boost your productivity with Lumina's immersive Pomodoro timer and virtual study rooms.",
    creator: "@LuminaApp",
    images: ["https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop"],
  },
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
  alternates: {
    canonical: "https://lumina-focus.app",
  },
};

import { AuthProvider } from "@/components/providers/AuthProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased bg-black text-foreground flex h-screen overflow-hidden select-none`}
      >
        <AuthProvider>
          <main className="flex-1 flex flex-col h-full relative overflow-hidden">
            {children}
          </main>
          <Toaster position="top-center" theme="dark" toastOptions={{
            style: {
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(16px)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'white'
            }
          }} />
        </AuthProvider>
      </body>
    </html>
  );
}
