import type { Metadata, Viewport } from "next";
import { Pixelify_Sans, Inter, JetBrains_Mono, Caveat } from "next/font/google";
import "@/styles/globals.css";
import { SITE_METADATA } from "@/lib/constants";
import { ScrollProgressAndBackToTop } from "@/components/ui/ScrollProgressAndBackToTop";

const pixelifySans = Pixelify_Sans({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-pixelify",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-jetbrains",
  display: "swap",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600"],
  variable: "--font-caveat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://stap.ai"),
  title: SITE_METADATA.title,
  description: SITE_METADATA.description,
  openGraph: {
    title: SITE_METADATA.title,
    description: SITE_METADATA.description,
    url: "/",
    siteName: "STAP",
    images: [
      {
        url: "/assets/hero.webp",
        width: 900,
        height: 900,
        alt: "STAP AI Recruitment Platform",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_METADATA.title,
    description: SITE_METADATA.description,
    images: ["/assets/hero.webp"],
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${pixelifySans.variable} ${inter.variable} ${jetbrainsMono.variable} ${caveat.variable}`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){
              try {
                var t = localStorage.getItem('stap-theme');
                if (t !== 'dark' && t !== 'light') {
                  t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                }
                document.documentElement.setAttribute('data-theme', t);
              } catch (e) {}
            })();`,
          }}
        />
      </head>
      <body>
        <ScrollProgressAndBackToTop />
        {children}
      </body>
    </html>
  );
}

