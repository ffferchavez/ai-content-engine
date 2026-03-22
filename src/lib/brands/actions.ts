"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentOrganizationId } from "@/lib/org";

export type BrandActionResult =
  | { ok: true }
  | { ok: false; error: string };

function guidelinesFromNotes(raw: string | null): Record<string, unknown> | null {
  const trimmed = raw?.trim() ?? "";
  if (!trimmed) return null;
  return { notes: trimmed };
}

const NO_ORG =
  "We couldn't load your account. Try signing out and signing in again. If that doesn't help, contact support.";

export async function createBrand(formData: FormData): Promise<BrandActionResult> {
  const orgId = await getCurrentOrganizationId();
  if (!orgId) {
    return { ok: false, error: NO_ORG };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { ok: false, error: "Please add a name for this brand." };
  }

  const description = String(formData.get("description") ?? "").trim() || null;
  const voice_notes = String(formData.get("voice_notes") ?? "").trim() || null;
  const target_audience = String(formData.get("target_audience") ?? "").trim() || null;
  const industry = String(formData.get("industry") ?? "").trim() || null;
  const default_language = String(formData.get("default_language") ?? "en").trim() || "en";

  const brand_notes = String(formData.get("brand_notes") ?? "");
  const brand_guidelines = guidelinesFromNotes(brand_notes);

  const supabase = await createClient();
  const { error } = await supabase.from("brands").insert({
    organization_id: orgId,
    name,
    description,
    voice_notes,
    target_audience,
    industry,
    brand_guidelines,
    default_language,
  });

  if (error) {
    console.error("[brands] create:", error.message);
    return { ok: false, error: "Something went wrong while saving. Please try again." };
  }

  revalidatePath("/brands");
  return { ok: true };
}

export async function updateBrand(formData: FormData): Promise<BrandActionResult> {
  const orgId = await getCurrentOrganizationId();
  if (!orgId) {
    return { ok: false, error: NO_ORG };
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return { ok: false, error: "Something went wrong. Please refresh the page." };
  }

  const name = String(formData.get("name") ?? "").trim();
  if (!name) {
    return { ok: false, error: "Please add a name for this brand." };
  }

  const description = String(formData.get("description") ?? "").trim() || null;
  const voice_notes = String(formData.get("voice_notes") ?? "").trim() || null;
  const target_audience = String(formData.get("target_audience") ?? "").trim() || null;
  const industry = String(formData.get("industry") ?? "").trim() || null;
  const default_language = String(formData.get("default_language") ?? "en").trim() || "en";

  const brand_notes = String(formData.get("brand_notes") ?? "");
  const brand_guidelines = guidelinesFromNotes(brand_notes);

  const supabase = await createClient();
  const { error } = await supabase
    .from("brands")
    .update({
      name,
      description,
      voice_notes,
      target_audience,
      industry,
      brand_guidelines,
      default_language,
    })
    .eq("id", id)
    .eq("organization_id", orgId);

  if (error) {
    console.error("[brands] update:", error.message);
    return { ok: false, error: "Something went wrong while saving. Please try again." };
  }

  revalidatePath("/brands");
  return { ok: true };
}

export async function deleteBrand(formData: FormData): Promise<BrandActionResult> {
  const orgId = await getCurrentOrganizationId();
  if (!orgId) {
    return { ok: false, error: NO_ORG };
  }

  const id = String(formData.get("id") ?? "").trim();
  if (!id) {
    return { ok: false, error: "Something went wrong. Please refresh the page." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("brands").delete().eq("id", id).eq("organization_id", orgId);

  if (error) {
    console.error("[brands] delete:", error.message);
    return { ok: false, error: "Couldn't delete this brand. Please try again." };
  }

  revalidatePath("/brands");
  return { ok: true };
}
