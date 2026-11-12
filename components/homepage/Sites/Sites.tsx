import type { SitesCopy, SiteTypeCard } from "@/types/homepage";
import SitesCarousel from "./SitesCarousel";

interface SitesProps {
  sites: SiteTypeCard[];
  copy: SitesCopy;
}

export default function Sites({ sites, copy }: SitesProps) {
  return (
    <section
      id="sites"
      className="section-pad flex flex-col gap-5 overflow-hidden bg-white max-md:pt-6 md:gap-6"
      aria-labelledby="sites-title"
    >
      <SitesCarousel sites={sites}>
        <h2
          id="sites-title"
          className="heading-xl max-w-[680px] max-md:max-w-[250px]"
          data-reveal="clip"
        >
          {copy.title}
        </h2>
      </SitesCarousel>
    </section>
  );
}
