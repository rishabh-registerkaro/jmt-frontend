import type { BannerContent } from "@/types/homepage";
import Photo from "@/components/common/Photo";

interface BannerProps {
  banner: BannerContent;
}

export default function Banner({ banner }: BannerProps) {
  return (
    <section className="flex flex-col bg-brown lg:min-h-[411px] lg:flex-row" aria-labelledby="banner-title">
      {/* Brown copy panel — 718 of 1440px in Figma, content aligned to the page gutter.
          wide: keep the copy on the 1280px grid on very wide screens. */}
      <div
        className={[
          "flex items-center px-5 pt-10 pb-7 md:px-8 md:py-[72px]",
          "lg:flex-[0_0_49.86%] lg:py-[10px] lg:pr-[10px] lg:pl-12 xl:pl-20 wide:pl-[calc((100vw_-_1280px)/2)]",
        ].join(" ")}
      >
        <div className="flex max-w-[628px] flex-col items-start gap-3 md:gap-[22px]" data-reveal-stagger>
          <h2 id="banner-title" className="heading-xl text-white">
            {banner.title}
          </h2>
          {banner.copy && (
            // 17.5px/29.8px, fluid down to 16px.
            <p className="m-0 text-[15px] leading-[20px] font-normal tracking-normal text-peach-200 md:text-[clamp(16px,15.4718309859px_+_0.1408450704vw,17.5px)] md:leading-[1.7028571429] md:text-on-brown">
              {banner.copy}
            </p>
          )}
          {banner.cta.label && (
            <a
              href={banner.cta.href}
              className={[
                "btn-base [--btn-h:52px] [--focus-color:#fff] min-w-[234px] bg-white hover:bg-peach-100",
                "text-[15.5px] leading-[24.8px] font-extrabold text-orange",
                // Mobile: compact pill, brown label.
                "max-md:min-w-0 max-md:px-7 max-md:py-[14px] max-md:leading-[21px] max-md:font-semibold max-md:text-brown max-md:[--btn-h:49px]",
              ].join(" ")}
            >
              {banner.cta.label}
            </a>
          )}
        </div>
      </div>
      <div className="relative h-[220px] overflow-hidden md:h-[340px] lg:h-auto lg:flex-auto" data-reveal="img">
        <Photo image={banner.image} sizes="(min-width: 1024px) 50vw, 100vw" />
      </div>
    </section>
  );
}
