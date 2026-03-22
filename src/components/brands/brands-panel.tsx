"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BrandRow } from "@/lib/brands/types";
import { createBrand, deleteBrand, updateBrand } from "@/lib/brands/actions";

function notesFromGuidelines(brand: BrandRow): string {
  const g = brand.brand_guidelines;
  if (!g || typeof g !== "object") return "";
  const n = g.notes;
  return typeof n === "string" ? n : "";
}

function Field({
  label,
  hint,
  htmlFor,
  children,
}: {
  label: string;
  hint?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-[15px] font-medium text-zinc-200">
        {label}
      </label>
      {hint ? <p className="text-sm text-zinc-500">{hint}</p> : null}
      {children}
    </div>
  );
}

const fieldClass =
  "w-full rounded-xl border border-white/10 bg-zinc-900/80 px-4 py-3 text-[15px] text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-amber-500/40 focus:ring-2 focus:ring-amber-500/20";
const textareaClass = `${fieldClass} min-h-[100px] resize-y leading-relaxed`;

const LANG_OPTIONS: { value: string; label: string }[] = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "it", label: "Italian" },
];

export function BrandsPanel({ brands }: { brands: BrandRow[] }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [listError, setListError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(brands.length === 0);

  async function refresh() {
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-12">
      <section>
        {brands.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              setCreateError(null);
              setShowAddForm((v) => !v);
            }}
            className="mb-6 w-full rounded-2xl border border-dashed border-white/20 bg-zinc-900/40 py-4 text-[15px] font-medium text-zinc-300 transition hover:border-amber-500/40 hover:bg-zinc-900/60 hover:text-zinc-100"
          >
            {showAddForm ? "Close" : "+ Add another brand"}
          </button>
        ) : null}

        {showAddForm || brands.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-zinc-900/50 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-zinc-50">
              {brands.length === 0 ? "Add your first brand" : "New brand"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-zinc-500">
              Tell us about the business or project. This helps the AI match your voice when you create
              posts.
            </p>
            <form
              className="mt-8 flex flex-col gap-6"
              onSubmit={async (e) => {
                e.preventDefault();
                setCreateError(null);
                const form = e.currentTarget;
                const fd = new FormData(form);
                try {
                  setPending(true);
                  const result = await createBrand(fd);
                  if (!result.ok) {
                    setCreateError(result.error);
                    return;
                  }
                  form.reset();
                  setShowAddForm(false);
                  await refresh();
                } catch {
                  setCreateError("Something went wrong. Please try again.");
                } finally {
                  setPending(false);
                }
              }}
            >
              <Field label="Brand or business name" htmlFor="create-name">
                <input
                  id="create-name"
                  name="name"
                  required
                  autoComplete="organization"
                  className={fieldClass}
                  placeholder="e.g. River Road Coffee"
                />
              </Field>

              <Field
                label="What do you do?"
                hint="A short sentence is enough."
                htmlFor="create-desc"
              >
                <textarea
                  id="create-desc"
                  name="description"
                  className={textareaClass}
                  placeholder="We run a neighborhood café and roast our own beans."
                />
              </Field>

              <div className="grid gap-6 sm:grid-cols-2">
                <Field
                  label="What kind of business is it?"
                  htmlFor="create-industry"
                >
                  <input
                    id="create-industry"
                    name="industry"
                    className={fieldClass}
                    placeholder="Café, studio, online shop…"
                  />
                </Field>
                <Field label="Language for posts" htmlFor="create-lang">
                  <select
                    id="create-lang"
                    name="default_language"
                    defaultValue="en"
                    className={`${fieldClass} appearance-none bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-10`}
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2371717a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                    }}
                  >
                    {LANG_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field
                label="How should posts sound?"
                hint="Friendly, bold, calm, funny — whatever fits you."
                htmlFor="create-voice"
              >
                <textarea
                  id="create-voice"
                  name="voice_notes"
                  className={textareaClass}
                  placeholder="Warm and welcoming. Avoid slang. Short sentences."
                />
              </Field>

              <Field
                label="Who are you talking to?"
                htmlFor="create-audience"
              >
                <textarea
                  id="create-audience"
                  name="target_audience"
                  className={textareaClass}
                  placeholder="Local families, remote workers, first-time visitors…"
                />
              </Field>

              <Field
                label="Anything else we should know? (optional)"
                hint="Rules, topics to avoid, seasonal promos — plain words are fine."
                htmlFor="create-notes"
              >
                <textarea
                  id="create-notes"
                  name="brand_notes"
                  className={textareaClass}
                  placeholder="We never run out-of-stock sales on Sundays."
                />
              </Field>

              {createError ? (
                <p className="text-sm text-red-400" role="alert">
                  {createError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-xl bg-amber-500 py-3.5 text-[15px] font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[200px] sm:px-8"
              >
                {pending ? "Saving…" : "Save brand"}
              </button>
            </form>
          </div>
        ) : null}
      </section>

      <section className="flex flex-col gap-4">
        {listError ? (
          <p className="text-sm text-red-400" role="alert">
            {listError}
          </p>
        ) : null}

        {brands.length === 0 ? null : (
          <>
            <h2 className="text-lg font-semibold text-zinc-50">Your brands</h2>
            <ul className="flex flex-col gap-3">
              {brands.map((brand) => (
                <li key={brand.id}>
                  {editingId === brand.id ? (
                    <div className="rounded-2xl border border-amber-500/30 bg-zinc-900/60 p-6 sm:p-8">
                      <h3 className="text-lg font-semibold text-zinc-50">Edit brand</h3>
                      <form
                        className="mt-8 flex flex-col gap-6"
                        onSubmit={async (e) => {
                          e.preventDefault();
                          setEditError(null);
                          const form = e.currentTarget;
                          const fd = new FormData(form);
                          try {
                            setPending(true);
                            const result = await updateBrand(fd);
                            if (!result.ok) {
                              setEditError(result.error);
                              return;
                            }
                            setEditingId(null);
                            await refresh();
                          } catch {
                            setEditError("Something went wrong. Please try again.");
                          } finally {
                            setPending(false);
                          }
                        }}
                      >
                        <input type="hidden" name="id" value={brand.id} />

                        <Field label="Brand or business name" htmlFor={`edit-name-${brand.id}`}>
                          <input
                            id={`edit-name-${brand.id}`}
                            name="name"
                            required
                            defaultValue={brand.name}
                            className={fieldClass}
                          />
                        </Field>

                        <Field
                          label="What do you do?"
                          hint="A short sentence is enough."
                          htmlFor={`edit-desc-${brand.id}`}
                        >
                          <textarea
                            id={`edit-desc-${brand.id}`}
                            name="description"
                            defaultValue={brand.description ?? ""}
                            className={textareaClass}
                          />
                        </Field>

                        <div className="grid gap-6 sm:grid-cols-2">
                          <Field
                            label="What kind of business is it?"
                            htmlFor={`edit-industry-${brand.id}`}
                          >
                            <input
                              id={`edit-industry-${brand.id}`}
                              name="industry"
                              defaultValue={brand.industry ?? ""}
                              className={fieldClass}
                            />
                          </Field>
                          <Field label="Language for posts" htmlFor={`edit-lang-${brand.id}`}>
                            <select
                              id={`edit-lang-${brand.id}`}
                              name="default_language"
                              defaultValue={brand.default_language}
                              className={`${fieldClass} appearance-none bg-[length:1rem] bg-[right_1rem_center] bg-no-repeat pr-10`}
                              style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2371717a'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
                              }}
                            >
                              {!LANG_OPTIONS.some((o) => o.value === brand.default_language) ? (
                                <option value={brand.default_language}>
                                  {brand.default_language} (saved)
                                </option>
                              ) : null}
                              {LANG_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </Field>
                        </div>

                        <Field
                          label="How should posts sound?"
                          hint="Friendly, bold, calm, funny — whatever fits you."
                          htmlFor={`edit-voice-${brand.id}`}
                        >
                          <textarea
                            id={`edit-voice-${brand.id}`}
                            name="voice_notes"
                            defaultValue={brand.voice_notes ?? ""}
                            className={textareaClass}
                          />
                        </Field>

                        <Field label="Who are you talking to?" htmlFor={`edit-audience-${brand.id}`}>
                          <textarea
                            id={`edit-audience-${brand.id}`}
                            name="target_audience"
                            defaultValue={brand.target_audience ?? ""}
                            className={textareaClass}
                          />
                        </Field>

                        <Field
                          label="Anything else we should know? (optional)"
                          htmlFor={`edit-notes-${brand.id}`}
                        >
                          <textarea
                            id={`edit-notes-${brand.id}`}
                            name="brand_notes"
                            defaultValue={notesFromGuidelines(brand)}
                            className={textareaClass}
                          />
                        </Field>

                        {editError ? (
                          <p className="text-sm text-red-400" role="alert">
                            {editError}
                          </p>
                        ) : null}

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <button
                            type="submit"
                            disabled={pending}
                            className="w-full rounded-xl bg-amber-500 py-3.5 text-[15px] font-semibold text-zinc-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[160px]"
                          >
                            {pending ? "Saving…" : "Save changes"}
                          </button>
                          <button
                            type="button"
                            className="rounded-xl py-3 text-[15px] font-medium text-zinc-400 transition hover:text-zinc-200"
                            onClick={() => {
                              setEditError(null);
                              setEditingId(null);
                            }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-white/10 bg-zinc-900/40 px-5 py-5 sm:px-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="text-[17px] font-semibold text-zinc-50">{brand.name}</h3>
                          {brand.description ? (
                            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
                              {brand.description}
                            </p>
                          ) : (
                            <p className="mt-2 text-sm text-zinc-600">No description yet</p>
                          )}
                        </div>
                        <div className="flex shrink-0 gap-2 sm:flex-col sm:items-end">
                          <button
                            type="button"
                            className="rounded-xl border border-white/15 px-4 py-2.5 text-sm font-medium text-zinc-200 transition hover:bg-white/5"
                            onClick={() => {
                              setListError(null);
                              setEditError(null);
                              setEditingId(brand.id);
                            }}
                          >
                            Edit
                          </button>
                          <form
                            onSubmit={async (e) => {
                              e.preventDefault();
                              if (!confirm(`Remove “${brand.name}”? You can add it again later.`)) {
                                return;
                              }
                              setListError(null);
                              const fd = new FormData(e.currentTarget);
                              try {
                                setPending(true);
                                const result = await deleteBrand(fd);
                                if (!result.ok) {
                                  setListError(result.error);
                                  return;
                                }
                                if (editingId === brand.id) setEditingId(null);
                                await refresh();
                              } catch {
                                setListError("Something went wrong. Please try again.");
                              } finally {
                                setPending(false);
                              }
                            }}
                          >
                            <input type="hidden" name="id" value={brand.id} />
                            <button
                              type="submit"
                              disabled={pending}
                              className="w-full rounded-xl px-4 py-2.5 text-sm font-medium text-red-400/90 transition hover:bg-red-500/10 disabled:opacity-60"
                            >
                              Remove
                            </button>
                          </form>
                        </div>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
