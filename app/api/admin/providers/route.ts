import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireRole } from "@/lib/auth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - admin list providers or fetch one by id
export async function GET(request: NextRequest) {
  try {
    await requireRole(["admin"]);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const id = searchParams.get("id");

    if (id) {
      const { data, error } = await supabase
        .from("service_providers")
        .select(`
          *,
          user:users(*),
          categories:provider_categories(category:categories(*)),
          cities:provider_cities(city:cities(*))
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return NextResponse.json({ success: true, data });
    }

    let query = supabase
      .from("service_providers")
      .select(`
        *,
        user:users(*),
        categories:provider_categories(category:categories(*)),
        cities:provider_cities(city:cities(*))
      `)
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("verification_status", status);
    }

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to fetch providers" },
      { status: 500 }
    );
  }
}


