import Image from "next/image";
import Link from "next/link";
import type { ContactInfo, NavLink } from "@/types/homepage";
import NavMenu from "./NavMenu";

interface NavbarProps {
  links: NavLink[];
  contact: ContactInfo;
}

export default function Navbar({ links, contact }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-brown/20 bg-white">
      {/* lg min-height 79px: Figma's 80px frame includes its 1px bottom border. */}
      <div className="site-container flex min-h-[68px] items-center gap-6 lg:min-h-[79px] lg:py-[7px]">
        <Link
          href="/"
          className="focus-ring inline-flex flex-none rounded-[8px]"
          aria-label="Joy Maa Tara Bama Kripa — home"
        >
          <Image
            src="/homepage/logo-header.svg"
            alt=""
            width={150}
            height={52}
            priority
            className="block h-auto w-[128px] lg:w-[150px]"
          />
        </Link>
        <NavMenu links={links} callHref={contact.phoneHref ?? "#contact"} />
      </div>
    </header>
  );
}
