"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { BrandRow } from "@/lib/brands/types";
import type { BrandUrls } from "@/lib/brands/urls";
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
      <label htmlFor={htmlFor} className="text-[15px] font-medium text-ui-text">
        {label}
      </label>
      {hint ? <p className="text-sm text-ui-muted-dim">{hint}</p> : null}
      {children}
    </div>
  );
}

function BrandUrlsReadOnly({ urls }: { urls: BrandUrls }) {
  const has =
    urls.website ||
    urls.instagram ||
    urls.facebook ||
    urls.linkedin ||
    (urls.custom?.length ?? 0) > 0;
  if (!has) return null;
  const linkClass =
    "font-medium text-ui-text underline decoration-black/25 underline-offset-[3px] transition hover:decoration-black";
  return (
    <div className="mt-3 flex flex-col gap-1.5 border-t border-black/10 pt-4">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ui-muted-dim">
        Context sources
      </p>
      <p className="text-xs text-ui-muted-dim">Saved for your profile — pages are not fetched automatically yet.</p>
      <ul className="flex flex-col gap-1.5 text-sm text-ui-muted">
        {urls.website ? (
          <li>
            <a href={urls.website} target="_blank" rel="noopener noreferrer" className={linkClass}>
              Website
            </a>
          </li>
        ) : null}
        {urls.instagram ? (
          <li>
            <a href={urls.instagram} target="_blank" rel="noopener noreferrer" className={linkClass}>
              Instagram
            </a>
          </li>
        ) : null}
        {urls.facebook ? (
          <li>
            <a href={urls.facebook} target="_blank" rel="noopener noreferrer" className={linkClass}>
              Facebook
            </a>
          </li>
        ) : null}
        {urls.linkedin ? (
          <li>
            <a href={urls.linkedin} target="_blank" rel="noopener noreferrer" className={linkClass}>
              LinkedIn
            </a>
          </li>
        ) : null}
        {urls.custom?.map((u, i) => (
          <li key={`${u}-${i}`}>
            <a href={u} target="_blank" rel="noopener noreferrer" className={linkClass}>
              Extra link {i + 1}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function BrandUrlsFormFields({
  idPrefix,
  defaultWebsite = "",
  defaultInstagram = "",
  defaultFacebook = "",
  defaultLinkedin = "",
  defaultCustomLines = "",
}: {
  idPrefix: string;
  defaultWebsite?: string;
  defaultInstagram?: string;
  defaultFacebook?: string;
  defaultLinkedin?: string;
  defaultCustomLines?: string;
}) {
  return (
    <div className="flex flex-col gap-6 border-t border-black/15 pt-6">
      <div>
        <h3 className="text-[15px] font-medium text-ui-text">Brand context sources</h3>
        <p className="mt-1 text-sm leading-relaxed text-ui-muted-dim">
          Company website and social profile URLs. Saved as brand context sources — we don&apos;t fetch these pages
          yet; they&apos;re for your reference and future use in generation.
        </p>
      </div>
      <Field label="Company website" htmlFor={`${idPrefix}-url-website`}>
        <input
          id={`${idPrefix}-url-website`}
          name="url_website"
          type="text"
          inputMode="url"
          autoComplete="url"
          defaultValue={defaultWebsite}
          className={fieldClass}
          placeholder="https://example.com"
        />
      </Field>
      <div className="grid gap-6 sm:grid-cols-2">
        <Field label="Instagram" htmlFor={`${idPrefix}-url-instagram`}>
          <input
            id={`${idPrefix}-url-instagram`}
            name="url_instagram"
            type="text"
            inputMode="url"
            defaultValue={defaultInstagram}
            className={fieldClass}
            placeholder="https://instagram.com/…"
          />
        </Field>
        <Field label="Facebook" htmlFor={`${idPrefix}-url-facebook`}>
          <input
            id={`${idPrefix}-url-facebook`}
            name="url_facebook"
            type="text"
            inputMode="url"
            defaultValue={defaultFacebook}
            className={fieldClass}
            placeholder="https://facebook.com/…"
          />
        </Field>
      </div>
      <Field label="LinkedIn" htmlFor={`${idPrefix}-url-linkedin`}>
        <input
          id={`${idPrefix}-url-linkedin`}
          name="url_linkedin"
          type="text"
          inputMode="url"
          defaultValue={defaultLinkedin}
          className={fieldClass}
          placeholder="https://linkedin.com/company/…"
        />
      </Field>
      <Field
        label="Extra URLs (optional)"
        hint="Up to 5 links, one per line — other profiles, Linktree, press, etc."
        htmlFor={`${idPrefix}-url-custom`}
      >
        <textarea
          id={`${idPrefix}-url-custom`}
          name="url_custom_lines"
          defaultValue={defaultCustomLines}
          className={textareaClass}
          placeholder={"https://linktr.ee/yourbrand\nhttps://…"}
        />
      </Field>
    </div>
  );
}

const fieldClass =
  "w-full rounded-none border border-black bg-ui-bg px-4 py-3 text-[15px] text-ui-text outline-none placeholder:text-ui-muted-dim focus:border-black focus:ring-1 focus:ring-black/10";
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
    <div className="flex w-full min-w-0 flex-col gap-10 sm:gap-12">
      <section>
        {brands.length > 0 ? (
          <button
            type="button"
            onClick={() => {
              setCreateError(null);
              setShowAddForm((v) => !v);
            }}
            className="mb-6 w-full rounded-none border border-dashed border-black/30 bg-ui-bg py-4 text-[15px] font-medium text-ui-muted transition hover:border-black hover:bg-neutral-50 hover:text-ui-text"
          >
            {showAddForm ? "Close" : "+ Add another brand"}
          </button>
        ) : null}

        {showAddForm || brands.length === 0 ? (
          <div className="rounded-none border border-black bg-ui-bg p-6 sm:p-8">
            <h2 className="text-xl font-medium tracking-[-0.02em] text-ui-text">
              {brands.length === 0 ? "Add your first brand" : "New brand"}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ui-muted-dim">
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

              <BrandUrlsFormFields idPrefix="create" />

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
                <p className="text-sm text-red-700" role="alert">
                  {createError}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={pending}
                className="w-full rounded-none bg-black py-3.5 text-[15px] font-medium text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[200px] sm:px-8"
              >
                {pending ? "Saving…" : "Save brand"}
              </button>
            </form>
          </div>
        ) : null}
      </section>

      <section className="flex flex-col gap-4">
        {listError ? (
          <p className="text-sm text-red-700" role="alert">
            {listError}
          </p>
        ) : null}

        {brands.length === 0 ? null : (
          <>
            <h2 className="text-[10px] font-medium uppercase tracking-[0.25em] text-ui-muted-dim">Your brands</h2>
            <ul className="mt-6 border-t border-black">
              {brands.map((brand) => (
                <li key={brand.id}>
                  {editingId === brand.id ? (
                    <div className="rounded-none border border-black bg-ui-bg p-6 sm:p-8">
                      <h3 className="text-xl font-medium tracking-[-0.02em] text-ui-text">Edit brand</h3>
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

                        <BrandUrlsFormFields
                          idPrefix={`edit-${brand.id}`}
                          defaultWebsite={brand.brand_urls?.website ?? ""}
                          defaultInstagram={brand.brand_urls?.instagram ?? ""}
                          defaultFacebook={brand.brand_urls?.facebook ?? ""}
                          defaultLinkedin={brand.brand_urls?.linkedin ?? ""}
                          defaultCustomLines={brand.brand_urls?.custom?.join("\n") ?? ""}
                        />

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
                          <p className="text-sm text-red-700" role="alert">
                            {editError}
                          </p>
                        ) : null}

                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                          <button
                            type="submit"
                            disabled={pending}
                            className="w-full rounded-none bg-black py-3.5 text-[15px] font-medium text-white transition hover:bg-neutral-900 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-[160px]"
                          >
                            {pending ? "Saving…" : "Save changes"}
                          </button>
                          <button
                            type="button"
                            className="rounded-none py-3 text-[15px] font-medium text-ui-muted transition hover:text-ui-text"
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
                    <div className="border-b border-black py-8">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                          <h3 className="text-lg font-medium tracking-[-0.02em] text-ui-text">{brand.name}</h3>
                          {brand.description ? (
                            <p className="mt-2 text-sm leading-relaxed text-ui-muted">
                              {brand.description}
                            </p>
                          ) : (
                            <p className="mt-2 text-sm text-ui-muted-dim">No description yet</p>
                          )}
                          <BrandUrlsReadOnly urls={brand.brand_urls} />
                        </div>
                        <div className="flex shrink-0 gap-2 sm:flex-col sm:items-end">
                          <button
                            type="button"
                            className="border border-black px-4 py-2.5 text-sm font-medium text-ui-text transition hover:bg-neutral-50"
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
                              className="w-full rounded-none px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:opacity-60"
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
