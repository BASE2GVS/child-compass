"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Banner } from "@/components/design-system";

type FormFeedbackBannerProps = {
  successMessage?: string;
  errorMessage?: string;
  successParam?: string;
  errorParam?: string;
};

type BannerState = {
  variant: "success" | "warning";
  message: string;
};

export default function FormFeedbackBanner({
  successMessage = "✓ Saved",
  errorMessage = "That didn't save just now. Please try again.",
  successParam = "saved",
  errorParam = "saveError",
}: FormFeedbackBannerProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [banner, setBanner] = useState<BannerState | null>(() => {
    const saved = searchParams.get(successParam) === "1";
    const errored = searchParams.get(errorParam) === "1";
    if (saved) return { variant: "success", message: successMessage };
    if (errored) return { variant: "warning", message: errorMessage };
    return null;
  });

  useEffect(() => {
    if (!banner) return;

    const next = new URLSearchParams(searchParams);
    next.delete(successParam);
    next.delete(errorParam);
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });

    const timer = window.setTimeout(() => setBanner(null), 5000);
    return () => window.clearTimeout(timer);
  }, [banner, searchParams, successParam, errorParam, pathname, router]);

  if (!banner) return null;
  return <Banner variant={banner.variant}>{banner.message}</Banner>;
}
