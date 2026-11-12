import { ArrowRight, User } from "lucide-react";
import type { ContactPageContent } from "@/data/contactPage";
import { Responsive } from "./Responsive";

// Figma "Workers line" — desktop 303:190, phones 304:362: a thin ruled strip
// above the footer sending job seekers to the Join our crew page.
export default function WorkersLine({ copy, href }: { copy: ContactPageContent["workers"]; href: string }) {
  return (
    <aside className="border-t border-sand bg-white">
      <p className="site-container m-0 flex flex-wrap items-center justify-center gap-x-[6px] gap-y-[4px] py-[16px] text-[13.5px] leading-[normal] text-slate md:gap-x-[10px] md:py-[20px] md:text-[14.5px]">
        <User aria-hidden="true" size={16} className="text-slate max-md:hidden" />
        {copy.text}
        <a
          href={href}
          className="inline-flex items-center gap-[4px] rounded-[4px] font-semibold text-orange no-underline focus-ring hover:underline"
        >
          <Responsive desktop={copy.link.desktop} mobile={copy.link.mobile} />
          <ArrowRight aria-hidden="true" size={14} className="text-orange" />
        </a>
      </p>
    </aside>
  );
}
