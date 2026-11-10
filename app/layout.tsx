import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Root document for the public Joy Maa Tara homepage. Mirrors the jmt-admin
// root layout this page used to render inside (same fonts, global CSS and body
// classes), so moving it to its own project changes nothing visually. The
// page's title/description come from app/(public)/page.tsx (CMS-editable).

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>{children}</body>
    </html>
  );
}
