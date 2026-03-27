"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import type { PostPackAssetRow } from "@/components/library/post-pack-block";
import {
  POST_PACK_COMPOSER_FIELDS,
  type PostPackComposerDraft,
  type PostPackComposerField,
  type PostPackFields,
} from "@/lib/generate/post-pack";
import { formatPlatformForDisplay } from "@/lib/platforms";

type CompareItem = {
  asset: PostPackAssetRow;
  parsed: PostPackFields;
};

type Props = {
  items: CompareItem[];
  draft: PostPackComposerDraft;
  onSelectField: (field: PostPackComposerField, index: number) => void;
};

const FIELD_CONFIG: Array<{ field: PostPackComposerField; label: string; helper: string }> = [
  { field: "hook", label: "Hook", helper: "The opening idea people notice first." },
  { field: "caption", label: "Caption", helper: "Main body copy for the post." },
  { field: "call_to_action", label: "Call to action", helper: "What you want the audience to do next." },
  { field: "hashtags", label: "Hashtags", helper: "Optional discovery and categorization tags." },
  { field: "visual_direction", label: "Visual direction", helper: "Creative direction for the post image or concept." },
  { field: "post_angle", label: "Post angle", helper: "Overall framing and positioning for the message." },
];

function fieldValue(parsed: PostPackFields, field: PostPackComposerField): string {
  if (POST_PACK_COMPOSER_FIELDS.includes(field)) {
    return parsed[field];
  }
  return "";
}

function PackHeader({ item, index }: { item: CompareItem; index: number }) {
  const platformLabel = formatPlatformForDisplay(item.asset.platform);

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-ui-muted-dim">
        <span>Post pack {index + 1}</span>
        <span className="rounded-none border border-black/20 px-2 py-0.5 text-[10px] font-bold tracking-[0.15em] text-ui-text">
          {item.parsed.suggested_format}
        </span>
      </div>
      <p className="text-base font-bold tracking-[-0.02em] text-ui-text">
        {item.asset.title || `Post pack ${index + 1}`}
      </p>
      {platformLabel ? <p className="text-xs text-ui-muted-dim">{platformLabel}</p> : null}
    </div>
  );
}

function SelectChip({
  selected,
  children,
}: {
  selected: boolean;
  children: string;
}) {
  return (
    <span
      className={[
        "inline-flex rounded-none border px-3 py-2 text-xs font-medium transition",
        selected
          ? "border-emerald-700 bg-emerald-700 text-white"
          : "border-black bg-black text-white group-hover:bg-white group-hover:text-black",
      ].join(" ")}
    >
      {children}
    </span>
  );
}

function FieldOption({
  label,
  value,
  selected,
  onSelect,
}: {
  label: string;
  value: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={[
        "group flex h-[240px] w-full flex-col gap-4 border p-4 text-left transition",
        selected
          ? "border-emerald-700 bg-emerald-50 shadow-[inset_0_0_0_1px_rgba(4,120,87,0.08)]"
          : "border-black/15 bg-ui-bg hover:border-black hover:bg-white",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ui-muted-dim">{label}</p>
        {selected ? <span className="text-xs font-bold text-emerald-800">Selected</span> : null}
      </div>
      <p className="max-h-40 whitespace-pre-wrap overflow-auto text-sm leading-relaxed text-ui-text">{value}</p>
      <div className="mt-auto">
        <SelectChip selected={selected}>
          {selected ? "Unselect" : "Select option"}
        </SelectChip>
      </div>
    </button>
  );
}

export function PostPackCompareTable({
  items,
  draft,
  onSelectField,
}: Props) {
  const [openMobileField, setOpenMobileField] = useState<PostPackComposerField | null>("hook");
  const desktopColumns = {
    gridTemplateColumns: `minmax(108px, 132px) repeat(${items.length}, minmax(250px, 1fr))`,
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-[10px] font-bold uppercase tracking-[0.25em] text-ui-muted-dim">
          Generated post packs
        </h2>
      </div>

      <div className="hidden overflow-x-auto lg:block">
        <div className="min-w-[1120px] border border-black/15 bg-ui-bg">
          <div className="grid" style={desktopColumns}>
            <div className="border-b border-black/15 bg-neutral-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-ui-muted-dim">Pack</p>
            </div>
            {items.map((item, index) => (
              <div key={item.asset.id} className="border-b border-l border-black/15 p-4">
                <div className="min-h-[96px]">
                  <PackHeader item={item} index={index} />
                </div>
              </div>
            ))}

            {FIELD_CONFIG.flatMap((config) => {
              return [
                <div key={`${config.field}-label`} className="border-b border-black/15 bg-neutral-50 p-4">
                  <p className="text-sm font-bold text-ui-text">{config.label}</p>
                  <p className="mt-2 text-xs leading-relaxed text-ui-muted-dim">{config.helper}</p>
                </div>,
                ...items.map((item, index) => {
                  const selected = draft.sources[config.field] === index;
                  return (
                    <div key={`${item.asset.id}-${config.field}`} className="border-b border-l border-black/15 bg-ui-bg p-4">
                      <FieldOption
                        label={`Post pack ${index + 1}`}
                        value={fieldValue(item.parsed, config.field)}
                        selected={selected}
                        onSelect={() => onSelectField(config.field, index)}
                      />
                    </div>
                  );
                }),
              ];
            })}
          </div>
        </div>
      </div>

      <div className="space-y-5 lg:hidden">
        {FIELD_CONFIG.map((config) => (
          <section key={`mobile-${config.field}`} className="rounded-none border border-black/15 bg-ui-bg">
            <button
              type="button"
              onClick={() => setOpenMobileField((current) => (current === config.field ? null : config.field))}
              className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left transition hover:bg-white"
            >
              <div>
                <p className="text-sm font-bold text-ui-text">{config.label}</p>
                <p className="mt-1 text-xs leading-relaxed text-ui-muted-dim">{config.helper}</p>
              </div>
              <span className="inline-flex shrink-0 items-center justify-center rounded-none border border-black/15 bg-ui-bg p-2 text-ui-text">
                {openMobileField === config.field ? (
                  <ChevronUp className="size-4" strokeWidth={2} aria-hidden />
                ) : (
                  <ChevronDown className="size-4" strokeWidth={2} aria-hidden />
                )}
              </span>
            </button>
            {openMobileField === config.field ? (
              <div className="grid gap-3 border-t border-black/10 p-4">
                {items.map((item, index) => {
                  const selected = draft.sources[config.field] === index;
                  return (
                    <FieldOption
                      key={`${item.asset.id}-mobile-${config.field}`}
                      label={`Post pack ${index + 1}`}
                      value={fieldValue(item.parsed, config.field)}
                      selected={selected}
                      onSelect={() => onSelectField(config.field, index)}
                    />
                  );
                })}
              </div>
            ) : null}
          </section>
        ))}
      </div>
    </section>
  );
}
