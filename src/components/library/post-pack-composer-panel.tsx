"use client";

import type { ReactNode } from "react";
import { PostPackSocialPreview } from "@/components/social-preview/post-pack-social-preview";
import {
  type PostPackComposerDraft,
  type PostPackComposerField,
  type PostPackFields,
} from "@/lib/generate/post-pack";

const mockupFontStyle = {
  fontFamily:
    'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
} as const;

type Props = {
  brandName: string;
  platform: string | null;
  previewFields: PostPackFields;
  previewTitle: string | null;
  draft: PostPackComposerDraft;
  placeholders: Record<PostPackComposerField, string>;
  isReady: boolean;
  accepted: boolean;
  saving: boolean;
  persistError: string | null;
  stage: "compare" | "images";
  canGoToImages: boolean;
  onAccept: () => void;
  onContinueToImages: () => void;
  onFieldChange: (field: PostPackComposerField, value: string) => void;
  onRestart: () => void;
  onDelete: () => void;
  onPostNow: () => void;
  onSchedulePost: () => void;
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
    <div className={`mx-auto w-full ${large ? "max-w-[396px]" : "max-w-[344px]"}`} style={mockupFontStyle}>
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
          <div className={`h-full px-2 ${large ? "pb-6 pt-12" : "pb-5 pt-11"}`}>{children}</div>
          <div className="pointer-events-none absolute inset-x-0 bottom-2 flex justify-center">
            <div className="h-1.5 w-24 rounded-full bg-black/75" />
          </div>
        </div>
      </div>
    </div>
  );
}

function ComposerField({
  label,
  value,
  placeholder,
  source,
  multiline = true,
  onChange,
}: {
  label: string;
  value: string;
  placeholder: string;
  source?: string;
  multiline?: boolean;
  onChange: (value: string) => void;
}) {
  return (
    <div className="border border-black/12 bg-white p-4 shadow-[0_1px_0_rgba(0,0,0,0.03)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ui-muted-dim">{label}</p>
        {source ? <span className="text-xs text-ui-muted-dim">{source}</span> : null}
      </div>
      {multiline ? (
        <textarea
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="mt-2 min-h-[110px] w-full resize-y border border-black/15 bg-ui-bg px-3 py-2 text-sm leading-relaxed text-ui-text outline-none placeholder:italic placeholder:text-ui-muted-dim focus:border-black focus:ring-1 focus:ring-black/10"
        />
      ) : (
        <input
          type="text"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="mt-2 w-full border border-black/15 bg-ui-bg px-3 py-2 text-sm leading-relaxed text-ui-text outline-none placeholder:italic placeholder:text-ui-muted-dim focus:border-black focus:ring-1 focus:ring-black/10"
        />
      )}
    </div>
  );
}

export function PostPackComposerPanel({
  brandName,
  platform,
  previewFields,
  previewTitle,
  draft,
  placeholders,
  isReady,
  accepted,
  saving,
  persistError,
  stage,
  canGoToImages,
  onAccept,
  onContinueToImages,
  onFieldChange,
  onRestart,
  onDelete,
  onPostNow,
  onSchedulePost,
}: Props) {
  const fieldSource = (field: PostPackComposerField) =>
    typeof draft.sources[field] === "number" ? `Selected from Post Pack ${draft.sources[field]! + 1}` : undefined;

  return (
    <section className="space-y-6">
      <div className="rounded-none border border-black/20 bg-ui-bg p-4 sm:p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ui-muted-dim">Final post</p>
        <p className="mt-1 text-xs text-ui-muted-dim">
          The preview stays visible while you compare copy. On large screens, finish the text on the left and move to
          images when you are ready.
        </p>
        <div className="mt-4">
          <IPhoneMockup size="default">
            <PostPackSocialPreview
              brandName={brandName}
              platform={platform}
              parsed={previewFields}
              packTitle={previewTitle}
              size="default"
              inPhone
            />
          </IPhoneMockup>
        </div>

        {stage === "compare" ? (
          <div className="mt-3">
            <button
              type="button"
              onClick={onContinueToImages}
              disabled={!canGoToImages}
              className="w-full rounded-none border border-black bg-white px-3 py-3 text-sm font-medium text-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              Continue to image generation
            </button>
          </div>
        ) : (
          <>
            <div className="mt-5">
              <button
                type="button"
                onClick={onAccept}
                disabled={!isReady || saving}
                className="w-full rounded-none border border-black bg-black px-3 py-3 text-sm font-medium text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? "Saving..." : accepted ? "Post accepted" : "Accept post"}
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onRestart}
                className="rounded-none border border-black bg-black px-3 py-3 text-sm font-medium text-white transition hover:bg-white hover:text-black"
              >
                Restart
              </button>
              <button
                type="button"
                onClick={onDelete}
                className="rounded-none border border-black bg-black px-3 py-3 text-sm font-medium text-white transition hover:bg-white hover:text-black"
              >
                Delete
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={onPostNow}
                disabled={!accepted}
                className="rounded-none border border-black bg-black px-3 py-3 text-sm font-medium text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                Post now
              </button>
              <button
                type="button"
                onClick={onSchedulePost}
                disabled={!accepted}
                className="rounded-none border border-black bg-black px-3 py-3 text-sm font-medium text-white transition hover:bg-white hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                Schedule post
              </button>
            </div>
          </>
        )}

        <div className="mt-5 space-y-4">
          <ComposerField
            label="Hook"
            value={draft.fields.hook ?? ""}
            placeholder={placeholders.hook}
            source={fieldSource("hook")}
            multiline={false}
            onChange={(value) => onFieldChange("hook", value)}
          />
          <ComposerField
            label="Caption"
            value={draft.fields.caption ?? ""}
            placeholder={placeholders.caption}
            source={fieldSource("caption")}
            onChange={(value) => onFieldChange("caption", value)}
          />
          <ComposerField
            label="Call to action"
            value={draft.fields.call_to_action ?? ""}
            placeholder={placeholders.call_to_action}
            source={fieldSource("call_to_action")}
            multiline={false}
            onChange={(value) => onFieldChange("call_to_action", value)}
          />
          <ComposerField
            label="Hashtags"
            value={draft.fields.hashtags ?? ""}
            placeholder={placeholders.hashtags}
            source={fieldSource("hashtags")}
            onChange={(value) => onFieldChange("hashtags", value)}
          />
        </div>

        <p className={`mt-4 text-sm ${accepted ? "text-emerald-800" : "text-ui-muted-dim"}`}>
          {accepted
            ? "Final post accepted for this session."
            : "Select the hook, caption, call to action, and hashtags to continue to images and accept the post."}
        </p>
        {persistError ? <p className="mt-2 text-sm text-red-700">{persistError}</p> : null}
      </div>
    </section>
  );
}
