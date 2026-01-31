"use client";

import React from 'react';
import { API_URL } from '@/lib/api-config'

import { StatCard } from '@/components/dashboard/StatCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyContext';

export default function DashboardPage() {
  const [user, setUser] = React.useState<any>(null);
  const { formatValue } = useCurrency();

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("nepo_token");
        if (!token) return;

        const response = await fetch(`${API_URL}/users/profile`, {
          headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard stats", error);
      }
    };

    fetchProfile();

    const handleSync = () => {
      const updated = localStorage.getItem("nepo_user");
      if (updated) {
        try {
          setUser(JSON.parse(updated));
        } catch (e) { }
      }
    };
    window.addEventListener('userUpdate', handleSync);
    return () => window.removeEventListener('userUpdate', handleSync);
  }, []);

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Wallet Balance"
          value={formatValue(user?.balance || 0)}
          description="Total funds available"
          icon={DollarSign}
        />
        <StatCard
          title="Total Orders"
          value="..."
          description="Your global SMM volume"
          icon={ShoppingCart}
        />
        <StatCard
          title="Account Status"
          value={user?.role?.toUpperCase() || "USER"}
          description="Premium membership"
          icon={Users}
        />
        <StatCard
          title="Growth"
          value="+0"
          description="Spending this month"
          icon={TrendingUp}
        />
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Your latest dashboard activity</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Dashboard content will appear here.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}