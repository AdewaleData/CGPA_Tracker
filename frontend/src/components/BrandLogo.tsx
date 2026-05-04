import type { SVGProps } from "react";

type BrandLogoProps = SVGProps<SVGSVGElement>;

/**
 * Flat vector mark (no gradients): rounded tile, cap, rising bars — brand violet + white.
 */
export function BrandLogo({ className, ...props }: BrandLogoProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
      {...props}
    >
      <rect width="40" height="40" rx="10" className="fill-brand-600" />
      <path d="M20 9L30 13L20 17L10 13L20 9Z" fill="white" fillOpacity="0.96" />
      <path
        d="M10 13v7l10 4 10-4v-7"
        stroke="white"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        strokeOpacity="0.92"
      />
      <rect x="14.4" y="24.8" width="2.35" height="5.2" rx="0.45" fill="white" fillOpacity="0.55" />
      <rect x="18.2" y="22.2" width="2.35" height="7.8" rx="0.45" fill="white" fillOpacity="0.78" />
      <rect x="22" y="20.4" width="2.35" height="9.6" rx="0.45" fill="white" fillOpacity="1" />
    </svg>
  );
}
