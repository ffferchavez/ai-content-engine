"use client";

import { useEffect, useMemo, useState } from "react";

type LocalImage = {
  id: string;
  file: File;
  url: string;
};

type Props = {
  ready: boolean;
  generatedImageUrl: string | null;
  uploadedImages: LocalImage[];
  onGeneratedImageUrlChange: (url: string | null) => void;
  onUploadedImagesChange: (images: LocalImage[]) => void;
  onFieldChange: (field: "post_angle" | "visual_direction", value: string) => void;
  onBackToText: () => void;
  generationPayload: {
    postAngle: string;
    hook: string;
    caption: string;
    callToAction: string;
    hashtags: string;
    visualDirection: string;
  };
};

type StepMode = "generate" | "upload";

function makeLocalImages(files: FileList | null, limit: number): LocalImage[] {
  if (!files) return [];
  return Array.from(files)
    .slice(0, limit)
    .filter((file) => file.type.startsWith("image/"))
    .map((file) => ({
      id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
      file,
      url: URL.createObjectURL(file),
    }));
}

export function PostPackImageStage({
  ready,
  generatedImageUrl,
  uploadedImages,
  onGeneratedImageUrlChange,
  onUploadedImagesChange,
  onFieldChange,
  onBackToText,
  generationPayload,
}: Props) {
  const [mode, setMode] = useState<StepMode>("generate");
  const [referenceImages, setReferenceImages] = useState<LocalImage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreviewOpen, setImagePreviewOpen] = useState(false);

  useEffect(() => {
    return () => {
      referenceImages.forEach((image) => URL.revokeObjectURL(image.url));
    };
  }, [referenceImages]);

  const currentPreviewUrl = useMemo(() => {
    if (mode === "upload" && uploadedImages[0]?.url) {
      return uploadedImages[0].url;
    }
    return generatedImageUrl;
  }, [generatedImageUrl, mode, uploadedImages]);

  async function runGenerate() {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("postAngle", generationPayload.postAngle);
      formData.set("hook", generationPayload.hook);
      formData.set("caption", generationPayload.caption);
      formData.set("callToAction", generationPayload.callToAction);
      formData.set("hashtags", generationPayload.hashtags);
      formData.set("visualDirection", generationPayload.visualDirection);
      referenceImages.forEach((image) => formData.append("referenceImages", image.file));

      const res = await fetch("/api/composer-image", {
        method: "POST",
        body: formData,
      });
      const data = (await res.json()) as { error?: string; imageUrl?: string };
      if (!res.ok) {
        setError(data.error ?? "Could not generate image");
        return;
      }
      onGeneratedImageUrlChange(data.imageUrl ?? null);
      setMode("generate");
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function updateReferenceImages(files: FileList | null) {
    setReferenceImages((prev) => {
      prev.forEach((image) => URL.revokeObjectURL(image.url));
      return makeLocalImages(files, 3);
    });
  }

  function updateUploadedImages(files: FileList | null) {
    onUploadedImagesChange((() => {
      uploadedImages.forEach((image) => URL.revokeObjectURL(image.url));
      return makeLocalImages(files, 3);
    })());
    onGeneratedImageUrlChange(null);
    setMode("upload");
  }

  return (
    <section className="space-y-5">
      <div>
        <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-ui-muted-dim">Images</h2>
        <p className="mt-2 text-sm leading-relaxed text-ui-muted">
          Finish the text first, then choose whether to generate one hero image with optional references or add your
          own images for the post.
        </p>
        <button
          type="button"
          onClick={onBackToText}
          className="mt-3 rounded-none border border-black/20 bg-ui-bg px-3 py-2 text-sm font-medium text-ui-text transition hover:border-black hover:bg-white"
        >
          Back to text selection
        </button>
      </div>

      <div className="border border-black/15 bg-ui-bg p-4">
        <div className="flex flex-wrap gap-2 border-b border-black/10 pb-4">
          <button
            type="button"
            onClick={() => setMode("generate")}
            className={`rounded-none border px-3 py-2 text-sm font-medium transition ${
              mode === "generate" ? "border-black bg-black text-white" : "border-black/20 bg-ui-bg text-ui-text hover:border-black hover:bg-white"
            }`}
          >
            Generate image
          </button>
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`rounded-none border px-3 py-2 text-sm font-medium transition ${
              mode === "upload" ? "border-black bg-black text-white" : "border-black/20 bg-ui-bg text-ui-text hover:border-black hover:bg-white"
            }`}
          >
            Add your own images
          </button>
        </div>

        {mode === "generate" ? (
          <div className="space-y-4 pt-4">
            <div className="grid gap-4">
              <div>
                <p className="text-sm font-medium text-ui-text">Image direction</p>
                <p className="mt-1 text-xs leading-relaxed text-ui-muted-dim">
                  Optional. Add visual direction or a post angle only if you want to guide the image model more
                  clearly. Leave them blank and the AI will infer them from the final text.
                </p>
              </div>
              <input
                type="text"
                value={generationPayload.postAngle}
                onChange={(event) => onFieldChange("post_angle", event.target.value)}
                placeholder="Optional post angle for the image"
                className="w-full border border-black/15 bg-white px-3 py-2 text-sm text-ui-text outline-none placeholder:italic placeholder:text-ui-muted-dim focus:border-black focus:ring-1 focus:ring-black/10"
              />
              <textarea
                value={generationPayload.visualDirection}
                onChange={(event) => onFieldChange("visual_direction", event.target.value)}
                placeholder="Optional visual direction for the image"
                className="min-h-[110px] w-full resize-y border border-black/15 bg-white px-3 py-2 text-sm leading-relaxed text-ui-text outline-none placeholder:italic placeholder:text-ui-muted-dim focus:border-black focus:ring-1 focus:ring-black/10"
              />
            </div>

            <div>
              <p className="text-sm font-medium text-ui-text">Optional reference images</p>
              <p className="mt-1 text-xs leading-relaxed text-ui-muted-dim">
                Upload up to 3 image files to guide the AI image generation. This is optional.
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => updateReferenceImages(event.currentTarget.files)}
              className="block w-full text-sm text-ui-text file:mr-4 file:border file:border-black file:bg-ui-bg file:px-3 file:py-2 file:text-sm file:font-medium"
            />
            {referenceImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {referenceImages.map((image) => (
                  // eslint-disable-next-line @next/next/no-img-element -- local object URLs
                  <img key={image.id} src={image.url} alt={image.file.name} className="aspect-square w-full border border-black/15 object-cover" />
                ))}
              </div>
            ) : null}
            <button
              type="button"
              onClick={runGenerate}
              disabled={!ready || loading}
              className="rounded-none bg-black px-4 py-3 text-sm font-medium text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? "Generating..." : generatedImageUrl ? "Regenerate image" : "Generate image"}
            </button>
          </div>
        ) : (
          <div className="space-y-4 pt-4">
            <div>
              <p className="text-sm font-medium text-ui-text">Your own images</p>
              <p className="mt-1 text-xs leading-relaxed text-ui-muted-dim">
                Upload up to 3 image files for this post. If you prefer to use your own media, you do not need AI image
                generation.
              </p>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(event) => updateUploadedImages(event.currentTarget.files)}
              className="block w-full text-sm text-ui-text file:mr-4 file:border file:border-black file:bg-ui-bg file:px-3 file:py-2 file:text-sm file:font-medium"
            />
            {uploadedImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-3">
                {uploadedImages.map((image) => (
                  // eslint-disable-next-line @next/next/no-img-element -- local object URLs
                  <img key={image.id} src={image.url} alt={image.file.name} className="aspect-square w-full border border-black/15 object-cover" />
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}

      {currentPreviewUrl ? (
        <div className="border border-black/15 bg-ui-bg p-4">
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ui-muted-dim">Current image</p>
          <button
            type="button"
            onClick={() => setImagePreviewOpen(true)}
            className="mt-3 block w-full max-w-md text-left"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- generated or local object URLs */}
            <img src={currentPreviewUrl} alt="Current post image" className="aspect-square w-full border border-black/15 object-cover transition hover:border-black" />
            <span className="mt-2 inline-flex rounded-none border border-black bg-black px-3 py-2 text-xs font-medium text-white transition hover:bg-white hover:text-black">
              Expand image
            </span>
          </button>
        </div>
      ) : null}

      {imagePreviewOpen && currentPreviewUrl ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Expanded current image preview"
          onClick={() => setImagePreviewOpen(false)}
        >
          <div className="w-full max-w-5xl" onClick={(event) => event.stopPropagation()}>
            <div className="mb-2 flex justify-end">
              <button
                type="button"
                onClick={() => setImagePreviewOpen(false)}
                className="rounded-none border border-white/70 px-3 py-1 text-sm text-white transition hover:bg-white/10"
              >
                Close
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element -- generated or local object URLs */}
            <img src={currentPreviewUrl} alt="Expanded current post image" className="max-h-[85vh] w-full border border-white/30 bg-black object-contain" />
          </div>
        </div>
      ) : null}
    </section>
  );
}
