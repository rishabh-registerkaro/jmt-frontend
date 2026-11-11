import type { Metadata } from "next";
import Link from "next/link";
import { Manrope } from "next/font/google";
import "./globals.css";

// 404 for any URL that isn't "/", "/bn" or "/hi". Needed because the root
// layout lives under the dynamic app/[lang] segment, so it can't render one
// itself (next.config.ts → experimental.globalNotFound).

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });

export const metadata: Metadata = {
  title: "Page not found — Joy Maa Tara Bama Kripa",
};

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className={`${manrope.variable} antialiased`}>
        <main className="site flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-4 text-center font-site text-ink">
          <h1 className="m-0 text-[28px] leading-[36px] font-bold">Page not found</h1>
          <p className="m-0 text-slate">পাতাটি পাওয়া যায়নি · पेज नहीं मिला</p>
          <Link href="/" className="btn-primary">
            Back to the homepage
          </Link>
        </main>
      </body>
    </html>
  );
}
