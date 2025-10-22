'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsCard } from "./StatsCard";
import { BookingsTable } from "./BookingsTable";
import { BookingWithRelations } from "@/types";
import { Calendar, Clock, CheckCircle, Search, Heart } from "lucide-react";

interface KlijentDashboardContentProps {
  bookings: BookingWithRelations[];
}

export function KlijentDashboardContent({ bookings }: KlijentDashboardContentProps) {
  const [activeTab, setActiveTab] = useState('pregled');

  // Calculate stats
  const pendingCount = bookings.filter(b => b.status === 'pending').length;
  const acceptedCount = bookings.filter(b => b.status === 'accepted').length;
  const completedCount = bookings.filter(b => b.status === 'completed').length;

  const sidebarItems = [
    { id: 'pregled', label: 'Pregled', icon: Calendar },
    { id: 'zahtjevi', label: 'Moji zahtjevi', icon: Clock },
    { id: 'povijest', label: 'Povijest', icon: CheckCircle },
    { id: 'postavke', label: 'Postavke', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-sm border-r">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
          </div>
          <nav className="px-4 pb-4">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700 border border-blue-200'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Main content */}
        <div className="flex-1 p-6">
          {activeTab === 'pregled' && (
            <div className="space-y-6">
              {/* Stats cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatsCard
                  title="Aktivni zahtjevi"
                  count={pendingCount}
                  icon={<Clock className="w-4 h-4" />}
                />
                <StatsCard
                  title="Zakazano"
                  count={acceptedCount}
                  icon={<CheckCircle className="w-4 h-4" />}
                />
                <StatsCard
                  title="Ukupno usluga"
                  count={completedCount}
                  icon={<Calendar className="w-4 h-4" />}
                />
              </div>

              {/* Active bookings table */}
              <Card>
                <CardHeader>
                  <CardTitle>Aktivni zahtjevi</CardTitle>
                </CardHeader>
                <CardContent>
                  <BookingsTable bookings={bookings} />
                </CardContent>
              </Card>

              {/* Quick access */}
              <Card>
                <CardHeader>
                  <CardTitle>Brzi pristup</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full justify-start" variant="outline">
                    <Search className="w-4 h-4 mr-2" />
                    Pretraži nove usluge
                  </Button>
                  <Button className="w-full justify-start" variant="outline" disabled>
                    <Heart className="w-4 h-4 mr-2" />
                    Moji favoriti
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'zahtjevi' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Moji zahtjevi</h3>
              <BookingsTable bookings={bookings} />
            </div>
          )}

          {activeTab === 'povijest' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Povijest</h3>
              <BookingsTable bookings={bookings.filter(b => b.status === 'completed' || b.status === 'cancelled')} />
            </div>
          )}

          {activeTab === 'postavke' && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Postavke</h3>
              <p className="text-muted-foreground">Postavke će biti dostupne uskoro.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
