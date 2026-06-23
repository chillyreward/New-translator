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
  title: "Jambo TV — AI Kikuyu Model",
  description: "AI-powered Kikuyu language tools. Translate English and Kiswahili into Gĩkũyũ instantly. Powered by Jambo TV.",
  keywords: [
    "Jambo TV",
    "Kikuyu AI",
    "Kikuyu translation",
    "Gikuyu translator",
    "AI translation Kenya",
    "Kiswahili to Kikuyu",
    "African language AI",
    "Kikuyu language tools",
    "Gĩkũyũ AI model",
  ],
  openGraph: {
    title: "Jambo TV — AI Kikuyu Model",
    description: "AI-powered Kikuyu language tools. Translate English and Kiswahili into Gĩkũyũ instantly.",
    url: "https://jambokikuyu.com",
    siteName: "Jambo TV",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jambo TV — AI Kikuyu Model",
    description: "AI-powered Kikuyu language tools by Jambo TV.",
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
