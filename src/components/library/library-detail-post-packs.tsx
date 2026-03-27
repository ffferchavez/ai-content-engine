"use client";

import { useState, type ReactNode } from "react";
import { PostPackImageActions } from "@/components/library/post-pack-image-actions";
import type { PostPackAssetRow } from "@/components/library/post-pack-block";
import { PostPackSocialPreview } from "@/components/social-preview/post-pack-social-preview";
import { CopyButton } from "@/components/ui/copy-button";
import { formatPostPackForCopy, parsePostPackFields } from "@/lib/generate/post-pack";
import { formatPlatformForDisplay } from "@/lib/platforms";

type Props = {
  brandName: string;
  postPacks: PostPackAssetRow[];
};

function IPhoneMockup({
  children,
  size = "default",
}: {
  children: ReactNode;
  size?: "default" | "large";
}) {
  const large = size === "large";
  return (
    <div className={`mx-auto w-full ${large ? "max-w-[460px]" : "max-w-[390px]"}`}>
      <div
        className={[
          "relative border border-black/35 bg-neutral-950 shadow-[0_26px_70px_rgba(0,0,0,0.28)]",
          large ? "rounded-[52px] p-3" : "rounded-[44px] p-[10px]",
        ].join(" ")}
      >
        <div
          className={[
            "relative aspect-9/19.5 overflow-hidden border border-black/20 bg-white",
            large ? "rounded-[42px]" : "rounded-[36px]",
          ].join(" ")}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-center pt-2">
            <div
              className={[
                "rounded-full bg-neutral-950/95 shadow-[inset_0_1px_2px_rgba(255,255,255,0.1)]",
                large ? "h-8 w-40" : "h-7 w-36",
              ].join(" ")}
            />
          </div>
          <div
            className={[
              "pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between font-medium text-neutral-800",
              large ? "px-7 pt-2.5 text-xs" : "px-6 pt-2 text-[11px]",
            ].join(" ")}
          >
            <span>9:41</span>
            <span>5G</span>
          </div>
          <div className={`h-full px-2 ${large ? "pb-6 pt-12" : "pb-5 pt-11"}`}>
            {children}
          </div>
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
            <div className="h-1.5 w-24 rounded-full bg-black/75" />
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="mt-5 first:mt-0">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ui-muted-dim">{label}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ui-muted">{value}</p>
    </div>
  );
}

export function LibraryDetailPostPacks({ brandName, postPacks }: Props) {
  const [items, setItems] = useState(postPacks);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const safeIndex = Math.min(Math.max(selectedIndex, 0), Math.max(items.length - 1, 0));
  const selected = items[safeIndex];
  const parsed = parsePostPackFields(selected?.metadata);
  const platformLabel = formatPlatformForDisplay(selected?.platform ?? null);
  const copyText =
    selected && parsed
      ? formatPostPackForCopy({
          title: selected.title,
          platform: platformLabel || null,
          fields: parsed,
        })
      : "";

  if (!selected || !parsed) {
    return (
      <div className="rounded-none border border-black/20 bg-ui-bg p-5">
        <p className="text-sm text-ui-warning/90">This post pack could not be displayed. Metadata may be missing.</p>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-[10px] font-medium uppercase tracking-[0.25em] text-ui-muted-dim">Post packs</h2>
        <div className="flex items-center gap-2 text-xs text-ui-muted-dim">
          <button
            type="button"
            onClick={() => setSelectedIndex((i) => Math.max(0, i - 1))}
            disabled={safeIndex === 0}
            className="rounded-none border border-black px-2 py-1 text-ui-text transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Prev
          </button>
          <span>
            {safeIndex + 1} / {items.length}
          </span>
          <button
            type="button"
            onClick={() => setSelectedIndex((i) => Math.min(items.length - 1, i + 1))}
            disabled={safeIndex === items.length - 1}
            className="rounded-none border border-black px-2 py-1 text-ui-text transition hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next
          </button>
        </div>
      </div>

      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item, idx) => {
          const itemParsed = parsePostPackFields(item.metadata);
          const selectedItem = idx === safeIndex;
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`w-full rounded-none border px-3 py-3 text-left transition ${
                  selectedItem
                    ? "border-black bg-black text-white"
                    : "border-black/25 bg-ui-bg text-ui-muted hover:border-black/40"
                }`}
              >
                <p
                  className={`text-[10px] font-medium uppercase tracking-[0.2em] ${
                    selectedItem ? "text-white/80" : "text-ui-muted-dim"
                  }`}
                >
                  Post pack {idx + 1}
                </p>
                <p className={`mt-1 line-clamp-1 text-sm font-medium ${selectedItem ? "text-white" : "text-ui-text"}`}>
                  {item.title || "Untitled pack"}
                </p>
                <p className={`mt-1 text-xs ${selectedItem ? "text-white/80" : "text-ui-muted-dim"}`}>
                  {itemParsed?.suggested_format ?? "unknown format"}
                </p>
              </button>
            </li>
          );
        })}
      </ul>

      <section className="rounded-none border border-black/20 bg-ui-bg p-4 sm:p-5 lg:hidden">
        <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ui-muted-dim">Live preview</p>
        <p className="mt-1 text-xs text-ui-muted-dim">iPhone preview while you review copy.</p>
        <div className="mt-4">
          <IPhoneMockup>
            <PostPackSocialPreview
              brandName={brandName}
              platform={selected.platform}
              parsed={parsed}
              packTitle={selected.title}
              size="default"
              inPhone
            />
          </IPhoneMockup>
        </div>
      </section>

      <div className="grid gap-7 lg:grid-cols-[minmax(0,1fr)_minmax(420px,560px)]">
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-black pb-5">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ui-muted-dim">
                {platformLabel || "Platform"} · {parsed.suggested_format}
              </p>
              <h3 className="mt-2 text-xl font-medium tracking-[-0.02em] text-ui-text sm:text-2xl">
                {selected.title || `Post pack ${safeIndex + 1}`}
              </h3>
            </div>
            {copyText ? <CopyButton text={copyText} label="Copy selected post pack" /> : null}
          </div>

          <Field label="Angle" value={parsed.post_angle} />
          <Field label="Hook" value={parsed.hook} />
          <Field label="Caption" value={parsed.caption} />
          <Field label="Call to action" value={parsed.call_to_action} />
          <Field label="Hashtags" value={parsed.hashtags} />
          <Field label="Visual direction" value={parsed.visual_direction} />

          <div className="mt-6 border-t border-black pt-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ui-muted-dim">Images</p>
            <p className="mt-1 text-xs text-ui-muted-dim">
              Generate or regenerate visuals for this selected post pack.
            </p>
            <div className="mt-4">
              <PostPackImageActions
                assetId={selected.id}
                metadata={selected.metadata}
                packTitle={selected.title}
                onMetadataUpdated={(metadata) => {
                  setItems((prev) =>
                    prev.map((item) => (item.id === selected.id ? { ...item, metadata } : item)),
                  );
                }}
              />
            </div>
          </div>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <section className="hidden rounded-none border border-black/20 bg-ui-bg p-4 sm:p-5 lg:block">
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ui-muted-dim">Live preview</p>
            <p className="mt-1 text-xs text-ui-muted-dim">iPhone preview while you review copy.</p>
            <div className="mt-4">
              <IPhoneMockup size="large">
                <PostPackSocialPreview
                  brandName={brandName}
                  platform={selected.platform}
                  parsed={parsed}
                  packTitle={selected.title}
                  size="large"
                  inPhone
                />
              </IPhoneMockup>
            </div>
          </section>

          {parsed.suggested_format === "carousel" && parsed.slides.length > 0 ? (
            <>
              <details className="border border-black/20 bg-ui-bg p-4 lg:hidden">
                <summary className="cursor-pointer text-[10px] font-medium uppercase tracking-[0.2em] text-ui-muted-dim">
                  Carousel slides ({parsed.slides.length})
                </summary>
                <ol className="mt-3 list-decimal space-y-4 pl-5">
                  {parsed.slides.map((slide) => (
                    <li key={slide.slide_number} className="text-sm">
                      <p className="font-medium text-ui-text">{slide.title}</p>
                      {slide.supporting_text ? (
                        <p className="mt-1 whitespace-pre-wrap text-ui-muted">{slide.supporting_text}</p>
                      ) : null}
                      <p className="mt-2 whitespace-pre-wrap text-ui-muted-dim">{slide.visual_direction}</p>
                      {slide.image_prompt ? (
                        <p className="mt-1 text-xs text-ui-muted-dim">Image prompt: {slide.image_prompt}</p>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </details>

              <section className="hidden border border-black/20 bg-ui-bg p-4 lg:block">
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ui-muted-dim">
                  Carousel slides ({parsed.slides.length})
                </p>
                <ol className="mt-3 list-decimal space-y-4 pl-5">
                  {parsed.slides.map((slide) => (
                    <li key={slide.slide_number} className="text-sm">
                      <p className="font-medium text-ui-text">{slide.title}</p>
                      {slide.supporting_text ? (
                        <p className="mt-1 whitespace-pre-wrap text-ui-muted">{slide.supporting_text}</p>
                      ) : null}
                      <p className="mt-2 whitespace-pre-wrap text-ui-muted-dim">{slide.visual_direction}</p>
                      {slide.image_prompt ? (
                        <p className="mt-1 text-xs text-ui-muted-dim">Image prompt: {slide.image_prompt}</p>
                      ) : null}
                    </li>
                  ))}
                </ol>
              </section>
            </>
          ) : null}
        </aside>
      </div>
    </section>
  );
}
