"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import VerificationModal from "@/components/dashboard/VerificationModal";

interface ProviderRow {
  id: string;
  business_name?: string | null;
  oib: string;
  created_at: string;
  user?: { email: string; full_name?: string | null; phone?: string | null } | null;
  categories?: { category: { id: string; name: string } }[];
  cities?: { city: { id: string; name: string } }[];
}

export default function PendingProvidersTable() {
  const [rows, setRows] = useState<ProviderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      setLoading(true);
      const res = await fetch("/api/admin/providers?status=pending");
      const json = await res.json();
      if (isMounted && json?.success) {
        setRows(json.data || []);
        setLoading(false);
      } else {
        setLoading(false);
      }
    })();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Učitavanje...</div>;
  }

  if (!rows.length) {
    return <div className="text-sm text-muted-foreground">Nema novih pružatelja za verifikaciju</div>;
  }

  return (
    <div>
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto border rounded-md">
        <table className="min-w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3">Ime/Naziv</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">OIB</th>
              <th className="text-left p-3">Kategorije</th>
              <th className="text-left p-3">Gradovi</th>
              <th className="text-left p-3">Datum registracije</th>
              <th className="text-left p-3">Akcije</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-t">
                <td className="p-3">{p.business_name || p.user?.full_name || "-"}</td>
                <td className="p-3">{p.user?.email}</td>
                <td className="p-3">{p.oib}</td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {p.categories?.map((c) => (
                      <Badge key={c.category.id} variant="secondary">{c.category.name}</Badge>
                    ))}
                  </div>
                </td>
                <td className="p-3">
                  <div className="flex flex-wrap gap-1">
                    {p.cities?.map((c) => (
                      <Badge key={c.city.id} variant="outline">{c.city.name}</Badge>
                    ))}
                  </div>
                </td>
                <td className="p-3">{new Date(p.created_at).toLocaleDateString("hr-HR")}</td>
                <td className="p-3">
                  <Dialog>
                    <DialogTrigger className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs">
                      Pregledaj
                    </DialogTrigger>
                    <DialogContent>
                      <VerificationModal providerId={p.id} />
                    </DialogContent>
                  </Dialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {rows.map((p) => (
          <div key={p.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">
                  {p.business_name || p.user?.full_name || "Nepoznato"}
                </h3>
                <p className="text-sm text-gray-500">{p.user?.email}</p>
              </div>
              <Dialog>
                <DialogTrigger className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs">
                  Pregledaj
                </DialogTrigger>
                <DialogContent>
                  <VerificationModal providerId={p.id} />
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="space-y-2">
              <div>
                <span className="font-medium">OIB:</span>
                <span className="ml-2">{p.oib}</span>
              </div>
              <div>
                <span className="font-medium">Datum registracije:</span>
                <span className="ml-2">{new Date(p.created_at).toLocaleDateString("hr-HR")}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div>
                <span className="font-medium">Kategorije:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {p.categories?.map((c) => (
                    <Badge key={c.category.id} variant="secondary" className="text-xs">
                      {c.category.name}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="font-medium">Gradovi:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {p.cities?.map((c) => (
                    <Badge key={c.city.id} variant="outline" className="text-xs">
                      {c.city.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


