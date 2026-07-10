"use client";

import Image from "next/image";
import { useState } from "react";

type BrandLogoVariant = "horizontal" | "icon" | "light" | "dark" | "pdf";
type BrandLogoSize = "sm" | "md" | "lg";

const logoByVariant: Record<BrandLogoVariant, { alt: string; src: string }> = {
  horizontal: {
    alt: "Produto Pronto",
    src: "/brand/logo-produto-pronto-horizontal.png",
  },
  icon: {
    alt: "Produto Pronto",
    src: "/brand/logo-produto-pronto-icon.png",
  },
  light: {
    alt: "Produto Pronto",
    src: "/brand/logo-produto-pronto-branca.png",
  },
  dark: {
    alt: "Produto Pronto",
    src: "/brand/logo-produto-pronto-preta.png",
  },
  pdf: {
    alt: "Produto Pronto",
    src: "/brand/logo-produto-pronto-pdf.png",
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
  dark: {
    sm: { width: 148, height: 36 },
    md: { width: 190, height: 46 },
    lg: { width: 238, height: 58 },
  },
  pdf: {
    sm: { width: 148, height: 36 },
    md: { width: 190, height: 46 },
    lg: { width: 238, height: 58 },
  },
};

export function BrandLogo({
  className = "",
  height,
  size = "md",
  variant = "horizontal",
  width,
}: {
  className?: string;
  height?: number;
  size?: BrandLogoSize;
  variant?: BrandLogoVariant;
  width?: number;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const logo = logoByVariant[variant];
  const dimensions = {
    ...sizeByVariant[variant][size],
    ...(width ? { width } : {}),
    ...(height ? { height } : {}),
  };
  const imageFailed = failedSrc === logo.src;

  if (imageFailed) {
    return (
      <span
        className={`inline-flex items-center whitespace-nowrap font-semibold tracking-[-0.01em] ${
          variant === "dark" ? "text-[#171717]" : "text-[#F7F5EF]"
        } ${className}`}
        style={{ minHeight: dimensions.height }}
      >
        {variant === "icon" ? "PP" : "Produto Pronto"}
      </span>
    );
  }

  return (
    <span
      className={`relative inline-flex max-w-full shrink-0 ${className}`}
      style={{ height: dimensions.height, width: dimensions.width }}
    >
      <Image
        alt={logo.alt}
        fill
        onError={() => setFailedSrc(logo.src)}
        priority
        sizes={`${dimensions.width}px`}
        src={logo.src}
        style={{ objectFit: "contain" }}
      />
    </span>
  );
}
