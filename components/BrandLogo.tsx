"use client";

import Image from "next/image";
import { useState } from "react";

type BrandLogoVariant = "horizontal" | "icon" | "light";
type BrandLogoSize = "sm" | "md" | "lg";

const logoByVariant: Record<BrandLogoVariant, { alt: string; src: string }> = {
  horizontal: {
    alt: "Produto Pronto",
    src: "/brand/logo-produto-pronto-horizontal.svg",
  },
  icon: {
    alt: "Produto Pronto",
    src: "/brand/logo-produto-pronto-icon.svg",
  },
  light: {
    alt: "Produto Pronto",
    src: "/brand/logo-produto-pronto-branca.svg",
  },
};

const sizeByVariant: Record<BrandLogoVariant, Record<BrandLogoSize, { height: number; width: number }>> = {
  horizontal: {
    sm: { width: 148, height: 36 },
    md: { width: 190, height: 46 },
    lg: { width: 238, height: 58 },
  },
  icon: {
    sm: { width: 34, height: 34 },
    md: { width: 44, height: 44 },
    lg: { width: 58, height: 58 },
  },
  light: {
    sm: { width: 148, height: 36 },
    md: { width: 190, height: 46 },
    lg: { width: 238, height: 58 },
  },
};

export function BrandLogo({
  className = "",
  size = "md",
  variant = "horizontal",
}: {
  className?: string;
  size?: BrandLogoSize;
  variant?: BrandLogoVariant;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const logo = logoByVariant[variant];
  const dimensions = sizeByVariant[variant][size];
  const imageFailed = failedSrc === logo.src;

  if (imageFailed) {
    return (
      <span
        className={`inline-flex items-center whitespace-nowrap font-semibold tracking-[-0.01em] text-[#F7F5EF] ${className}`}
        style={{ minHeight: dimensions.height }}
      >
        {variant === "icon" ? "PP" : "Produto Pronto"}
      </span>
    );
  }

  return (
    <Image
      alt={logo.alt}
      className={`h-auto max-w-full object-contain ${className}`}
      height={dimensions.height}
      onError={() => setFailedSrc(logo.src)}
      priority
      src={logo.src}
      style={{ maxHeight: dimensions.height, width: dimensions.width }}
      width={dimensions.width}
    />
  );
}
