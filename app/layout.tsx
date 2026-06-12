import type { Metadata } from "next";
import { Noto_Serif, Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { StoreProvider } from "@/lib/store";
import { APP_NAME } from "@/lib/constants";

const notoSerif = Noto_Serif({
  subsets: ["latin"],
  variable: "--font-noto-serif",
  weight: ["400", "500", "600", "700"],
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "NeuroGrowthTech — AI Marketing for African Languages",
  description: "AI-powered translation and marketing tools. Reach Kikuyu, Swahili, and African language speakers with intelligent content. Translate English and Kiswahili into Gikuyu instantly.",
  keywords: [
    "NeuroGrowthTech",
    "AI marketing Africa",
    "Kikuyu translation",
    "African language AI",
    "Gikuyu translator",
    "AI translation Kenya",
    "Kiswahili translation",
    "neuro marketing technology",
    "African language marketing",
    "Kikuyu AI tools"
  ],
  openGraph: {
    title: "NeuroGrowthTech — AI Marketing for African Languages",
    description: "AI-powered translation and marketing tools. Reach Kikuyu, Swahili, and African language speakers.",
    url: "https://neurogrowthtech.com",
    siteName: "NeuroGrowthTech",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NeuroGrowthTech — AI Marketing for African Languages",
    description: "AI-powered translation and marketing tools for African language speakers.",
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
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
        className={`${notoSerif.variable} ${plusJakartaSans.variable} font-sans text-slate-900 bg-white dark:bg-slate-950 dark:text-slate-50 transition-colors`}
      >
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <StoreProvider>
            {children}
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
