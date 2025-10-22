import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireRole } from "@/lib/auth";
import { createConnectedAccount, createAccountLink } from "@/lib/stripe-connect";
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

    // Dohvati provider podatke s user emailom
    const { data: provider, error: providerError } = await supabase
      .from("service_providers")
      .select(`
        *,
        user_id
      `)
      .eq("id", providerId)
      .single();

    if (providerError || !provider) {
      throw new Error("Provider not found");
    }

    // Dohvati user podatke
    const { data: user } = await supabase
      .from("users")
      .select("email, full_name")
      .eq("id", provider.user_id)
      .single();

    // Update verification status
    const { error: updateError } = await supabase
      .from("service_providers")
      .update({ verification_status: "verified", updated_at: new Date().toISOString() })
      .eq("id", providerId);

    if (updateError) throw updateError;

    // Kreiraj Stripe Connect Express account
    const account = await createConnectedAccount(providerId, user.email);
    
    // Generiraj onboarding link
    const onboardingLink = await createAccountLink(account.id);

    // Log admin akciju
    await supabase.from("admin_actions").insert({
      admin_id: admin.id,
      action_type: "verify_provider",
      target_type: "provider",
      target_id: providerId,
      details: adminNote ? { note: adminNote } : null,
    });

    // Pošalji email pružatelju s onboarding linkom
    try {
      const providerName = provider.business_name || user.full_name;
      
      await sendEmail({
        to: user.email,
        subject: 'Vaš profil je verificiran - Marketplace',
        html: emailTemplates.providerVerified(providerName, onboardingLink)
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Ne bacamo error jer provider je već verificiran
    }

    return NextResponse.json({ 
      success: true, 
      onboardingLink,
      message: "Provider approved and Stripe account created" 
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Failed to approve provider" },
      { status: 500 }
    );
  }
}


