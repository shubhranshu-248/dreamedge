import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700", "800"],
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
      className={`${inter.variable} ${playfair.variable} h-full antialiased`}
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
