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
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireRole(["admin"]);
    const providerId = params.id;
    const body = await request.json().catch(() => ({}));
    const adminNote = body?.note || null;

    // Dohvati provider podatke prije update-a
    const { data: provider } = await supabase
      .from("service_providers")
      .select(`
        business_name,
        user:users(full_name, email)
      `)
      .eq("id", providerId)
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
      if (provider?.user?.email) {
        const providerName = provider.business_name || provider.user.full_name;
        
        await sendEmail({
          to: provider.user.email,
          subject: 'Profil nije odobren - Marketplace',
          html: emailTemplates.providerRejected(providerName, adminNote)
        });
      }
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Ne bacamo error jer provider je već odbijen
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to reject provider" },
      { status: 500 }
    );
  }
}


