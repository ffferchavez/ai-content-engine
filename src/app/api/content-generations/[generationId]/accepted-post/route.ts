import { NextResponse } from "next/server";
import { getCurrentOrganizationId } from "@/lib/org";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

type AcceptedPostPayload = {
  fields?: Record<string, string | null | undefined>;
  generatedImageUrl?: string | null;
};

export async function POST(
  request: Request,
  context: { params: Promise<{ generationId: string }> },
) {
  const { generationId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = await getCurrentOrganizationId();
  if (!orgId) {
    return NextResponse.json({ error: "No workspace" }, { status: 400 });
  }

  const { data: generation, error: generationError } = await supabase
    .from("content_generations")
    .select("id, organization_id, output_summary")
    .eq("id", generationId)
    .maybeSingle();

  if (generationError || !generation || generation.organization_id !== orgId) {
    return NextResponse.json({ error: "Generation not found" }, { status: 404 });
  }

  let body: AcceptedPostPayload;
  try {
    body = (await request.json()) as AcceptedPostPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const fields = body.fields && typeof body.fields === "object" ? body.fields : {};
  const summary =
    generation.output_summary && typeof generation.output_summary === "object" && generation.output_summary !== null
      ? { ...(generation.output_summary as Record<string, unknown>) }
      : {};

  summary.accepted_post = {
    fields,
    generated_image_url:
      typeof body.generatedImageUrl === "string" && body.generatedImageUrl.trim()
        ? body.generatedImageUrl
        : null,
    accepted_at: new Date().toISOString(),
  };

  const { error: updateError } = await supabase
    .from("content_generations")
    .update({ output_summary: summary, updated_at: new Date().toISOString() })
    .eq("id", generationId);

  if (updateError) {
    return NextResponse.json({ error: "Could not save accepted post" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, accepted_post: summary.accepted_post });
}

export async function DELETE(
  _request: Request,
  context: { params: Promise<{ generationId: string }> },
) {
  const { generationId } = await context.params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const orgId = await getCurrentOrganizationId();
  if (!orgId) {
    return NextResponse.json({ error: "No workspace" }, { status: 400 });
  }

  const { data: generation, error: generationError } = await supabase
    .from("content_generations")
    .select("id, organization_id, output_summary")
    .eq("id", generationId)
    .maybeSingle();

  if (generationError || !generation || generation.organization_id !== orgId) {
    return NextResponse.json({ error: "Generation not found" }, { status: 404 });
  }

  const summary =
    generation.output_summary && typeof generation.output_summary === "object" && generation.output_summary !== null
      ? { ...(generation.output_summary as Record<string, unknown>) }
      : {};

  delete summary.accepted_post;

  const { error: updateError } = await supabase
    .from("content_generations")
    .update({ output_summary: summary, updated_at: new Date().toISOString() })
    .eq("id", generationId);

  if (updateError) {
    return NextResponse.json({ error: "Could not delete accepted post" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
