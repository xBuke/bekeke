import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireRole } from "@/lib/auth";
import { sendEmail, emailTemplates } from "@/lib/email";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const admin = await requireRole(["admin"]);
    const resolvedParams = await params;
    const providerId = resolvedParams.id;
    const body = await request.json().catch(() => ({}));
    const adminNote = body?.note || null;

    // Dohvati provider podatke prije update-a
    const { data: provider } = await supabase
      .from("service_providers")
      .select(`
        business_name,
        user_id
      `)
      .eq("id", providerId)
      .single();

    // Dohvati user podatke
    const { data: user } = await supabase
      .from("users")
      .select("full_name, email")
      .eq("id", provider?.user_id)
      .single();

    const { error: updateError } = await supabase
      .from("service_providers")
      .update({ verification_status: "rejected", updated_at: new Date().toISOString() })
      .eq("id", providerId);

    if (updateError) throw updateError;

    await supabase.from("admin_actions").insert({
      admin_id: admin.id,
      action_type: "reject_provider",
      target_type: "provider",
      target_id: providerId,
      details: adminNote ? { note: adminNote } : null,
    });

    // Pošalji email pružatelju s razlogom odbijanja
    try {
      if (user?.email) {
        const providerName = provider?.business_name || user.full_name;
        
        await sendEmail({
          to: user.email,
          subject: 'Profil nije odobren - Marketplace',
          html: emailTemplates.providerRejected(providerName, adminNote)
        });
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Ne bacamo error jer provider je već odbijen
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to reject provider" },
      { status: 500 }
    );
  }
}


