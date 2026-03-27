"use client";

import { useState } from "react";
import type { PostPackFields } from "@/lib/generate/post-pack";
import { isFacebookPlatform } from "@/components/social-preview/platform";

type Props = {
  brandName: string;
  platform: string | null;
  parsed: PostPackFields;
  packTitle: string | null;
  size?: "default" | "large";
  inPhone?: boolean;
};

const previewFontStyle = {
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
} as const;

function initials(name: string): string {
  const t = name.trim();
  if (!t) return "?";
  const parts = t.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return t.slice(0, 2).toUpperCase();
}

function PreviewImage({
  src,
  alt,
  aspectClass,
}: {
  src: string | null;
  alt: string;
  aspectClass: string;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- dynamic URLs from storage
      <img src={src} alt={alt} className={`w-full object-cover ${aspectClass}`} />
    );
  }
  return (
    <div
      className={`flex w-full items-center justify-center bg-neutral-100 text-center text-xs leading-relaxed text-neutral-400 ${aspectClass}`}
    >
      No image yet
      <span className="sr-only"> — generate an image to see it in the preview</span>
    </div>
  );
}

function CaptionBlock({
  parsed,
  packTitle,
  compact,
  inPhone,
  size,
}: {
  parsed: Props["parsed"];
  packTitle: string | null;
  compact?: boolean;
  inPhone?: boolean;
  size?: Props["size"];
}) {
  const phoneLarge = inPhone && size === "large";
  return (
    <div className={compact ? "px-3 pb-3 pt-2" : "px-3 pb-4 pt-3"}>
      {packTitle ? (
        <p className={`font-semibold text-neutral-900 ${compact ? "text-[13px]" : "text-sm"}`}>{packTitle}</p>
      ) : null}
      <p
        className={[
          "mt-1 whitespace-pre-wrap text-neutral-800",
          compact ? "text-[13px] leading-snug" : "text-sm leading-relaxed",
          inPhone ? (phoneLarge ? "line-clamp-7" : "line-clamp-5") : "",
        ].join(" ")}
      >
        <span className="font-medium">{parsed.hook}</span>
        {"\n\n"}
        {parsed.caption}
      </p>
      {parsed.call_to_action ? (
        <p className={`mt-2 text-neutral-600 ${compact ? "text-xs" : "text-[13px]"}`}>{parsed.call_to_action}</p>
      ) : null}
      <p
        className={[
          "mt-2 whitespace-pre-wrap text-blue-900/90",
          compact ? "text-[12px]" : "text-[13px] leading-relaxed",
          inPhone ? (phoneLarge ? "line-clamp-3" : "line-clamp-2") : "",
        ].join(" ")}
      >
        {parsed.hashtags}
      </p>
    </div>
  );
}

function IgActionBar() {
  return (
    <div className="border-b border-black/5 px-3 py-2">
      <div className="flex items-center justify-between text-neutral-900">
        <div className="flex items-center gap-3">
          <HeartIcon />
          <CommentIcon />
          <ShareIcon />
        </div>
        <BookmarkIcon />
      </div>
      <p className="mt-1 text-[11px] font-medium text-neutral-700">1,204 likes</p>
    </div>
  );
}

function FbMetaRow() {
  return (
    <div className="border-b border-[#dddfe2] bg-white px-3 py-2">
      <p className="text-[12px] text-[#65676B]">235 reactions · 18 comments · 7 shares</p>
    </div>
  );
}

function IgHeader({ brandName }: { brandName: string }) {
  return (
    <div className="flex items-center gap-2 border-b border-black/5 px-3 py-2.5">
      <div
        className="flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-amber-400 via-pink-500 to-purple-600 text-[11px] font-semibold text-white"
        aria-hidden
      >
        {initials(brandName)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-neutral-950">{brandName}</p>
        <p className="text-[11px] text-neutral-500">Suggested preview · Just now</p>
      </div>
    </div>
  );
}

function FbHeader({ brandName }: { brandName: string }) {
  return (
    <div className="flex items-start gap-2 px-3 pt-3">
      <div
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-[#1877f2]/15 text-[12px] font-semibold text-[#1877f2]"
        aria-hidden
      >
        {initials(brandName)}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[15px] font-semibold leading-tight text-[#050505]">{brandName}</p>
        <p className="mt-0.5 text-[12px] text-[#65676B]">
          Suggested preview · <span className="inline-block">Just now ·</span>{" "}
          <span aria-hidden>🌐</span>
        </p>
      </div>
    </div>
  );
}

function InstagramStaticPreview({ brandName, parsed, packTitle, size = "default", inPhone = false }: Props) {
  const maxWidth = inPhone ? "max-w-none" : size === "large" ? "max-w-[460px]" : "max-w-[400px]";
  const maxHeight = inPhone
    ? size === "large"
      ? "max-h-[320px]"
      : "max-h-[240px]"
    : size === "large"
      ? "max-h-[min(88vw,460px)]"
      : "max-h-[min(85vw,400px)]";

  return (
    <div
      className={`mx-auto w-full ${maxWidth} overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm`}
      style={previewFontStyle}
    >
      <IgHeader brandName={brandName} />
      <PreviewImage src={parsed.image_url} alt="" aspectClass={`aspect-square ${maxHeight}`} />
      <IgActionBar />
      <CaptionBlock parsed={parsed} packTitle={packTitle} compact inPhone={inPhone} size={size} />
    </div>
  );
}

function InstagramCarouselPreview({
  brandName,
  parsed,
  packTitle,
  size = "default",
  inPhone = false,
}: Props) {
  const slides = parsed.slides;
  const [idx, setIdx] = useState(0);
  const active = slides[idx] ?? slides[0];
  const src = active?.image_url ?? null;
  const n = slides.length;
  const maxWidth = inPhone ? "max-w-none" : size === "large" ? "max-w-[460px]" : "max-w-[400px]";
  const maxHeight = inPhone
    ? size === "large"
      ? "max-h-[320px]"
      : "max-h-[240px]"
    : size === "large"
      ? "max-h-[min(88vw,460px)]"
      : "max-h-[min(85vw,400px)]";

  const go = (d: number) => {
    setIdx((i) => {
      const next = i + d;
      if (next < 0) return n - 1;
      if (next >= n) return 0;
      return next;
    });
  };

  return (
    <div
      className={`mx-auto w-full ${maxWidth} overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm`}
      style={previewFontStyle}
    >
      <IgHeader brandName={brandName} />
      <div className="relative bg-black/5">
        <PreviewImage src={src} alt={active ? `Slide ${active.slide_number}` : ""} aspectClass={`aspect-square ${maxHeight}`} />
        <p className="absolute right-2 top-2 rounded bg-black/45 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
          {idx + 1} / {n}
        </p>
        {n > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/55"
              aria-label="Previous slide"
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/55"
              aria-label="Next slide"
            >
              <ChevronRightIcon />
            </button>
            <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
              {slides.map((s, i) => (
                <span
                  key={s.slide_number}
                  className={`size-1.5 rounded-full ${i === idx ? "bg-white" : "bg-white/50"}`}
                  aria-hidden
                />
              ))}
            </div>
          </>
        ) : null}
      </div>
      {active ? (
        <p className="border-b border-black/5 px-3 py-2 text-[12px] text-neutral-600">
          <span className="font-medium text-neutral-900">Slide {active.slide_number}</span>
          {active.title ? `: ${active.title}` : ""}
        </p>
      ) : null}
      <IgActionBar />
      <CaptionBlock parsed={parsed} packTitle={packTitle} compact inPhone={inPhone} size={size} />
    </div>
  );
}

function FacebookStaticPreview({ brandName, parsed, packTitle, size = "default", inPhone = false }: Props) {
  const maxWidth = inPhone ? "max-w-none" : size === "large" ? "max-w-[620px]" : "max-w-[500px]";
  const maxHeight = inPhone
    ? size === "large"
      ? "max-h-[260px]"
      : "max-h-[200px]"
    : size === "large"
      ? "max-h-[min(72vw,500px)]"
      : "max-h-[min(70vw,420px)]";

  return (
    <div
      className={`mx-auto w-full ${maxWidth} overflow-hidden rounded-lg border border-[#dddfe2] bg-white shadow-sm`}
      style={previewFontStyle}
    >
      <FbHeader brandName={brandName} />
      <p className="px-3 pb-2 text-[15px] leading-snug text-[#050505]">
        <span className="font-semibold">{parsed.hook}</span>
      </p>
      <PreviewImage src={parsed.image_url} alt="" aspectClass={`aspect-[1.91/1] ${maxHeight} bg-[#f0f2f5]`} />
      <FbMetaRow />
      <div className="bg-[#f0f2f5] px-3 py-2.5">
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-[#050505]">{parsed.caption}</p>
        {parsed.call_to_action ? (
          <p className="mt-2 text-[13px] text-[#65676B]">{parsed.call_to_action}</p>
        ) : null}
        <p className="mt-2 whitespace-pre-wrap text-[14px] text-[#1877f2]">{parsed.hashtags}</p>
        {packTitle ? <p className="mt-2 text-[12px] text-[#65676B]">{packTitle}</p> : null}
      </div>
    </div>
  );
}

function FacebookCarouselPreview({
  brandName,
  parsed,
  packTitle,
  size = "default",
  inPhone = false,
}: Props) {
  const slides = parsed.slides;
  const [idx, setIdx] = useState(0);
  const active = slides[idx] ?? slides[0];
  const src = active?.image_url ?? null;
  const n = slides.length;
  const maxWidth = inPhone ? "max-w-none" : size === "large" ? "max-w-[620px]" : "max-w-[500px]";
  const maxHeight = inPhone
    ? size === "large"
      ? "max-h-[260px]"
      : "max-h-[200px]"
    : size === "large"
      ? "max-h-[min(72vw,500px)]"
      : "max-h-[min(70vw,420px)]";

  const go = (d: number) => {
    setIdx((i) => {
      const next = i + d;
      if (next < 0) return n - 1;
      if (next >= n) return 0;
      return next;
    });
  };

  return (
    <div
      className={`mx-auto w-full ${maxWidth} overflow-hidden rounded-lg border border-[#dddfe2] bg-white shadow-sm`}
      style={previewFontStyle}
    >
      <FbHeader brandName={brandName} />
      <p className="px-3 pb-2 text-[15px] leading-snug text-[#050505]">
        <span className="font-semibold">{parsed.hook}</span>
      </p>
      <div className="relative bg-[#f0f2f5]">
        <PreviewImage src={src} alt={active ? `Slide ${active.slide_number}` : ""} aspectClass={`aspect-[1.91/1] ${maxHeight}`} />
        <p className="absolute right-2 top-2 rounded bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white">
          {idx + 1} / {n}
        </p>
        {n > 1 ? (
          <>
            <button
              type="button"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#050505] shadow transition hover:bg-white"
              aria-label="Previous slide"
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 flex size-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#050505] shadow transition hover:bg-white"
              aria-label="Next slide"
            >
              <ChevronRightIcon />
            </button>
          </>
        ) : null}
      </div>
      {active ? (
        <p className="border-b border-[#dddfe2] px-3 py-2 text-[13px] text-[#65676B]">
          <span className="font-semibold text-[#050505]">Slide {active.slide_number}</span>
          {active.title ? ` — ${active.title}` : ""}
        </p>
      ) : null}
      <FbMetaRow />
      <div className="bg-[#f0f2f5] px-3 py-2.5">
        <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-[#050505]">{parsed.caption}</p>
        {parsed.call_to_action ? (
          <p className="mt-2 text-[13px] text-[#65676B]">{parsed.call_to_action}</p>
        ) : null}
        <p className="mt-2 whitespace-pre-wrap text-[14px] text-[#1877f2]">{parsed.hashtags}</p>
        {packTitle ? <p className="mt-2 text-[12px] text-[#65676B]">{packTitle}</p> : null}
      </div>
    </div>
  );
}

function TextOnlyConceptPreview({ brandName, parsed, packTitle, label }: Props & { label: string }) {
  return (
    <div
      className="mx-auto w-full max-w-[400px] overflow-hidden rounded-xl border border-dashed border-black/20 bg-ui-bg/80 p-4"
      style={previewFontStyle}
    >
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ui-muted-dim">{label}</p>
      <p className="mt-2 text-xs text-ui-muted-dim">
        No feed preview for this format — copy below is what you&apos;d produce or film separately.
      </p>
      <p className="mt-3 text-sm font-semibold text-ui-text">{brandName}</p>
      {packTitle ? <p className="mt-1 text-sm text-ui-muted">{packTitle}</p> : null}
      <p className="mt-3 whitespace-pre-wrap text-sm text-ui-text">{parsed.hook}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm text-ui-muted">{parsed.caption}</p>
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 18l-6-6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M9 18l6-6-6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12.1 20.3l-.1.1-.1-.1C7.1 16 4 13.1 4 9.6 4 7.4 5.7 5.7 7.9 5.7c1.3 0 2.5.6 3.2 1.6.7-1 1.9-1.6 3.2-1.6 2.2 0 3.9 1.7 3.9 3.9 0 3.5-3.1 6.4-7.9 10.7z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CommentIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M21 11.5c0 4.1-4 7.5-9 7.5-1.3 0-2.6-.2-3.7-.6L3 20l1.4-4.1C3.5 14.7 3 13.1 3 11.5 3 7.4 7 4 12 4s9 3.4 9 7.5z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ShareIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function BookmarkIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M6 3h12v18l-6-3-6 3V3z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function PostPackSocialPreview(props: Props) {
  const { parsed, platform } = props;
  const fb = isFacebookPlatform(platform);

  if (parsed.suggested_format === "reel" || parsed.suggested_format === "story") {
    return (
      <TextOnlyConceptPreview
        {...props}
        label={parsed.suggested_format === "reel" ? "Reel (concept)" : "Story (concept)"}
      />
    );
  }

  if (fb) {
    if (parsed.suggested_format === "carousel" && parsed.slides.length > 0) {
      return <FacebookCarouselPreview {...props} />;
    }
    return <FacebookStaticPreview {...props} />;
  }

  if (parsed.suggested_format === "carousel" && parsed.slides.length > 0) {
    return <InstagramCarouselPreview {...props} />;
  }

  return <InstagramStaticPreview {...props} />;
}
