import type { Metadata } from "next";
import Link from "next/link";

// 404 for unknown URLs and notFound() calls; renders inside the root layout.

export const metadata: Metadata = {
  title: "Page not found — Joy Maa Tara Bama Kripa",
};

export default function NotFound() {
  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="m-0 text-[28px] leading-[36px] font-bold">Page not found</h1>
      <Link href="/" className="btn-primary">
        Back to the homepage
      </Link>
    </section>
  );
}
