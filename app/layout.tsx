import type { Metadata } from "next";
import { Fraunces, Work_Sans } from "next/font/google";
import "./globals.css";
import { Navbar } from "./components/navbar";
import { Footer } from "./components/footer";
import { TFLiteErrorSuppressor } from "./components/tflite-error-suppressor";
import { ModelCacheProvider } from "@/lib/model-cache-context";
import { ThemeProvider } from "./components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const workSans = Work_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Signademy - Learn American Sign Language",
  description:
    "Learn American Sign Language through interactive modules, challenges, and AI-powered tools.",
  openGraph: {
    title: "Signademy - Learn American Sign Language",
    description:
      "Master ASL through interactive video lessons, AI-powered tools, and fun challenges.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${workSans.variable} ${fraunces.variable} font-sans antialiased`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TFLiteErrorSuppressor />
          <ModelCacheProvider>
            <div id="top" className="sr-only" />
            <Navbar />
            <main id="content" className="min-h-[calc(100vh-4rem)]">
              {children}
            </main>
            <Footer />
          </ModelCacheProvider>
          <Toaster richColors position="bottom-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
