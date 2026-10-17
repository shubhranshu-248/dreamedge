import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
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
  title: {
    default: "Dream Edge Online — Premium Coaching for Classes 6-10",
    template: "%s | Dream Edge Online",
  },
  description:
    "Master your foundation with Dream Edge. Premium online coaching for Classes 6-10 (CBSE & State Board) by IITian mentors. Concept-based learning, live classes, test series & more.",
  keywords: [
    "online coaching",
    "classes 6-10",
    "CBSE coaching",
    "maths coaching",
    "science coaching",
    "Dream Edge",
    "foundation courses",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Dream Edge Online",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
