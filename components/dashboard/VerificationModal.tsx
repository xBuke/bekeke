"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";

interface ProviderDetail {
  id: string;
  business_name?: string | null;
  oib: string;
  description?: string | null;
  emergency_available: boolean;
  emergency_fee?: number | null;
  id_card_url?: string | null;
  profile_photo_url?: string | null;
  created_at: string;
  user?: { email: string; full_name?: string | null; phone?: string | null } | null;
  categories?: { category: { id: string; name: string } }[];
  cities?: { city: { id: string; name: string } }[];
}

export default function VerificationModal({ providerId }: { providerId: string }) {
  const [data, setData] = useState<ProviderDetail | null>(null);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      const res = await fetch(`/api/admin/providers?id=${providerId}`);
      const json = await res.json();
      if (isMounted && json?.success) {
        setData(json.data);
        setLoading(false);
      } else {
        setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, [providerId]);

  const handleAction = async (action: "approve" | "reject") => {
    setSubmitting(true);
    const res = await fetch(`/api/admin/providers/${providerId}/${action}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ note }),
    });
    setSubmitting(false);
    if (res.ok) {
      // Best-effort refresh
      window.location.reload();
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Učitavanje...</div>;
  }

  if (!data) {
    return <div className="text-sm text-red-600">Greška pri učitavanju podataka</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Verifikacija pružatelja</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div>
            <div className="text-sm text-muted-foreground">Ime/Naziv</div>
            <div className="font-medium">{data.business_name || data.user?.full_name || "-"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Email</div>
            <div className="font-medium">{data.user?.email}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Telefon</div>
            <div className="font-medium">{data.user?.phone || "-"}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">OIB</div>
            <div className="font-medium">{data.oib}</div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Hitne intervencije</div>
            <div className="font-medium">{data.emergency_available ? `Da${data.emergency_fee ? ` (+${data.emergency_fee}€)` : ""}` : "Ne"}</div>
          </div>
        </div>
        <div className="space-y-2">
          <div>
            <div className="text-sm text-muted-foreground">Kategorije</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {data.categories?.map((c) => (
                <Badge key={c.category.id} variant="secondary">{c.category.name}</Badge>
              ))}
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground">Gradovi</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {data.cities?.map((c) => (
                <Badge key={c.city.id} variant="outline">{c.city.name}</Badge>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="text-sm text-muted-foreground">Opis</div>
        <p className="text-sm whitespace-pre-wrap">{data.description || "-"}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.id_card_url && (
          <div>
            <div className="text-sm text-muted-foreground mb-1">Osobna iskaznica</div>
            <img src={data.id_card_url} alt="ID" className="rounded-md border" />
          </div>
        )}
        {data.profile_photo_url && (
          <div>
            <div className="text-sm text-muted-foreground mb-1">Profilna fotografija</div>
            <img src={data.profile_photo_url} alt="Profil" className="rounded-full border w-28 h-28 object-cover" />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm text-muted-foreground">Bilješka administratora (opcionalno)</label>
        <textarea
          className="w-full min-h-[80px] border rounded-md p-2 text-sm"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Unesi bilješku"
        />
      </div>

      <div className="flex gap-2 justify-end">
        <button
          onClick={() => handleAction("reject")}
          disabled={submitting}
          className="px-4 py-2 rounded-md bg-red-600 text-white text-sm disabled:opacity-50"
        >
          Odbij
        </button>
        <button
          onClick={() => handleAction("approve")}
          disabled={submitting}
          className="px-4 py-2 rounded-md bg-emerald-600 text-white text-sm disabled:opacity-50"
        >
          Odobri
        </button>
      </div>
    </div>
  );
}


