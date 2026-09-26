import Image from "next/image";
import Link from "next/link";

type BrandLogoProps = {
  href?: string;
  size?: "sm" | "md" | "lg";
  subtitle?: string;
  className?: string;
};

export function BrandLogo({
  href = "/",
  size = "md",
  subtitle = "SPORTSWEARTZ",
  className = "",
}: BrandLogoProps) {
  const imageSizes = {
    sm: { width: 32, height: 32, textClass: "text-base", subClass: "text-[8px]" },
    md: { width: 40, height: 40, textClass: "text-xl", subClass: "text-[10px]" },
    lg: { width: 52, height: 52, textClass: "text-2xl", subClass: "text-xs" },
  };

  const { width, height, textClass, subClass } = imageSizes[size];

  const content = (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white/80 p-1 shadow-sm ring-1 ring-black/5">
        <Image
          src="/logo.png"
          alt="Andres Sportsweartz"
          width={width}
          height={height}
          className="h-8 w-8 object-contain sm:h-9 sm:w-9"
          priority
        />
      </div>
      <div className="leading-none">
        <b className={`block tracking-tighter ${textClass}`}>ANDRES</b>
        <span className={`block font-bold tracking-[.25em] text-[#ff6b2c] ${subClass}`}>
          {subtitle}
        </span>
      </div>
    </div>
  );

  if (!href) return content;

  return (
    <Link href={href} className="transition hover:opacity-90">
      {content}
    </Link>
  );
}

