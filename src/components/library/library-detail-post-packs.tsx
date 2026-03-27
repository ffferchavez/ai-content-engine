"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PostPackCompareTable } from "@/components/library/post-pack-compare-table";
import { PostPackComposerPanel } from "@/components/library/post-pack-composer-panel";
import { PostPackImageStage } from "@/components/library/post-pack-image-stage";
import type { PostPackAssetRow } from "@/components/library/post-pack-block";
import {
  parsePostPackFields,
  type PostPackComposerDraft,
  type PostPackComposerField,
  type PostPackFields,
} from "@/lib/generate/post-pack";

type Props = {
  generationId: string;
  brandName: string;
  initialAcceptedPost?: {
    fields?: Partial<Record<PostPackComposerField, string>>;
    generated_image_url?: string | null;
    accepted_at?: string;
  } | null;
  postPacks: PostPackAssetRow[];
};

const REQUIRED_FIELDS = ["hook", "caption", "call_to_action", "hashtags"] as const;

const PLACEHOLDERS: Record<PostPackComposerField, string> = {
  hook: "Select your hook",
  caption: "Select your caption",
  call_to_action: "Select your call to action",
  hashtags: "Select your hashtags",
  visual_direction: "Select your visual direction",
  post_angle: "Select your post angle",
};

function createEmptyDraft(): PostPackComposerDraft {
  return { fields: {}, sources: {} };
}

function buildPreviewFields(draft: PostPackComposerDraft): PostPackFields {
  return {
    post_angle: draft.fields.post_angle ?? PLACEHOLDERS.post_angle,
    suggested_format: "static post",
    hook: draft.fields.hook ?? PLACEHOLDERS.hook,
    caption: draft.fields.caption ?? PLACEHOLDERS.caption,
    call_to_action: draft.fields.call_to_action ?? PLACEHOLDERS.call_to_action,
    hashtags: draft.fields.hashtags ?? PLACEHOLDERS.hashtags,
    visual_direction: draft.fields.visual_direction ?? PLACEHOLDERS.visual_direction,
    slides: [],
    image_prompt: null,
    image_url: null,
    media_url: null,
    media_status: "not_generated",
  };
}

export function LibraryDetailPostPacks({ generationId, brandName, initialAcceptedPost, postPacks }: Props) {
  const router = useRouter();
  const compareRef = useRef<HTMLDivElement>(null);
  const [draft, setDraft] = useState<PostPackComposerDraft>(() => ({
    fields: initialAcceptedPost?.fields ?? {},
    sources: {},
  }));
  const [accepted, setAccepted] = useState(Boolean(initialAcceptedPost?.fields));
  const [stage, setStage] = useState<"compare" | "images">(
    initialAcceptedPost?.fields?.hook &&
      initialAcceptedPost?.fields?.caption &&
      initialAcceptedPost?.fields?.call_to_action &&
      initialAcceptedPost?.fields?.hashtags
      ? "images"
      : "compare",
  );
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(
    initialAcceptedPost?.generated_image_url ?? null,
  );
  const [uploadedImages, setUploadedImages] = useState<Array<{ id: string; file: File; url: string }>>([]);
  const [saving, setSaving] = useState(false);
  const [persistError, setPersistError] = useState<string | null>(null);

  const parsedItems = useMemo(
    () =>
      postPacks
        .map((asset) => {
          const parsed = parsePostPackFields(asset.metadata);
          return parsed ? { asset, parsed } : null;
        })
        .filter((item): item is { asset: PostPackAssetRow; parsed: PostPackFields } => Boolean(item)),
    [postPacks],
  );

  const invalidCount = postPacks.length - parsedItems.length;
  const previewFields = buildPreviewFields(draft);
  const finalPreviewImageUrl = uploadedImages[0]?.url ?? generatedImageUrl;
  previewFields.image_url = finalPreviewImageUrl;
  previewFields.media_url = finalPreviewImageUrl;
  previewFields.media_status = finalPreviewImageUrl ? "ready" : "not_generated";
  const previewTitle = "Your final post";
  const previewPlatform = parsedItems[0]?.asset.platform ?? null;
  const isReady = REQUIRED_FIELDS.every((field) => {
    const value = draft.fields[field];
    return typeof value === "string" && value.trim().length > 0;
  });

  function onSelectField(field: PostPackComposerField, index: number) {
    const item = parsedItems[index];
    if (!item) return;

    setAccepted(false);
    setPersistError(null);
    setGeneratedImageUrl(null);
    setUploadedImages([]);
    setDraft((prev) => {
      const nextDraft = {
        ...(prev.sources[field] === index
        ? {
            fields: Object.fromEntries(
              Object.entries(prev.fields).filter(([key]) => key !== field),
            ) as PostPackComposerDraft["fields"],
            sources: Object.fromEntries(
              Object.entries(prev.sources).filter(([key]) => key !== field),
            ) as PostPackComposerDraft["sources"],
          }
        : {
            fields: {
              ...prev.fields,
              [field]: item.parsed[field],
            },
            sources: {
              ...prev.sources,
              [field]: index,
            },
          }),
      } as PostPackComposerDraft;

      return nextDraft;
    });
  }

  function onFieldChange(field: PostPackComposerField, value: string) {
    setAccepted(false);
    setPersistError(null);
    setGeneratedImageUrl(null);
    setUploadedImages([]);

    setDraft((prev) => {
      const trimmedValue = value.trim();
      const nextDraft =
        trimmedValue.length === 0
          ? ({
              fields: Object.fromEntries(
                Object.entries(prev.fields).filter(([key]) => key !== field),
              ) as PostPackComposerDraft["fields"],
              sources: Object.fromEntries(
                Object.entries(prev.sources).filter(([key]) => key !== field),
              ) as PostPackComposerDraft["sources"],
            })
          : ({
              fields: {
                ...prev.fields,
                [field]: value,
              },
              sources:
                prev.sources[field] === undefined
                  ? prev.sources
                  : (Object.fromEntries(
                      Object.entries(prev.sources).filter(([key]) => key !== field),
                    ) as PostPackComposerDraft["sources"]),
            });

      return nextDraft;
    });
  }

  if (parsedItems.length === 0) {
    return (
      <div className="rounded-none border border-black/20 bg-ui-bg p-5">
        <p className="text-sm text-ui-warning/90">This post pack could not be displayed. Metadata may be missing.</p>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      {invalidCount > 0 ? (
        <p className="text-sm text-ui-warning/90">
          {invalidCount} saved {invalidCount === 1 ? "pack is" : "packs are"} missing metadata and won&apos;t appear
          in the comparison view.
        </p>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(360px,500px)]">
        <div ref={compareRef} className="min-w-0">
          {stage === "compare" ? (
            <PostPackCompareTable
              items={parsedItems}
              draft={draft}
              onSelectField={onSelectField}
            />
          ) : (
            <PostPackImageStage
              ready={isReady}
              generatedImageUrl={generatedImageUrl}
              uploadedImages={uploadedImages}
              onGeneratedImageUrlChange={setGeneratedImageUrl}
              onUploadedImagesChange={setUploadedImages}
              onFieldChange={onFieldChange}
              onBackToText={() => {
                setStage("compare");
                compareRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
              }}
              generationPayload={{
                postAngle: draft.fields.post_angle ?? "",
                hook: draft.fields.hook ?? "",
                caption: draft.fields.caption ?? "",
                callToAction: draft.fields.call_to_action ?? "",
                hashtags: draft.fields.hashtags ?? "",
                visualDirection: draft.fields.visual_direction ?? "",
              }}
            />
          )}
        </div>

        <aside className="min-w-0 xl:sticky xl:top-24 xl:self-start">
          <PostPackComposerPanel
            brandName={brandName}
            platform={previewPlatform}
            previewFields={previewFields}
            previewTitle={previewTitle}
            draft={draft}
            placeholders={PLACEHOLDERS}
            isReady={isReady}
            accepted={accepted}
            saving={saving}
            persistError={persistError}
            stage={stage}
            canGoToImages={isReady}
            onAccept={async () => {
              if (!isReady) return;
              setSaving(true);
              setPersistError(null);
              try {
                const res = await fetch(`/api/content-generations/${generationId}/accepted-post`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ fields: draft.fields, generatedImageUrl }),
                });
                const data = (await res.json()) as { error?: string };
                if (!res.ok) {
                  setPersistError(data.error ?? "Could not save the accepted post.");
                  return;
                }
                setAccepted(true);
              } catch {
                setPersistError("Network error. Try again.");
              } finally {
                setSaving(false);
              }
            }}
            onContinueToImages={() => {
              if (!isReady) return;
              setStage("images");
            }}
            onFieldChange={onFieldChange}
            onRestart={() => {
              router.push("/generate");
            }}
            onDelete={async () => {
              setSaving(true);
              setPersistError(null);
              try {
                await fetch(`/api/content-generations/${generationId}/accepted-post`, {
                  method: "DELETE",
                });
              } catch {
                // Ignore clear errors and still reset local state.
              } finally {
                setSaving(false);
              }
              setAccepted(false);
              setDraft(createEmptyDraft());
              setGeneratedImageUrl(null);
              setUploadedImages([]);
              setStage("compare");
              compareRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
            }}
            onPostNow={() => {
              window.alert("Posting is coming next.");
            }}
            onSchedulePost={() => {
              window.alert("Scheduling is coming next.");
            }}
          />
        </aside>
      </div>
    </section>
  );
}
