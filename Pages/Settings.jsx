import React, { useState, useEffect } from "react";
import { User, Transaction } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  User as UserIcon, 
  Camera,
  Shield,
  History
} from "lucide-react";

import ProfileSection from "../components/settings/ProfileSection";
import BalanceSection from "../components/settings/BalanceSection";
import TransactionHistory from "../components/settings/TransactionHistory";

export default function Settings() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      const userTransactions = await Transaction.filter(
        { user_email: currentUser.email }, 
        "-created_date", 
        20
      );
      
      setUser(currentUser);
      setTransactions(userTransactions);
    } catch (error) {
      console.error("Error loading settings data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = () => {
    loadData();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">הגדרות</h1>
        <p className="text-gray-400">נהל את החשבון והפרופיל שלך</p>
      </div>

      <ProfileSection user={user} onUpdate={refreshData} />

      <BalanceSection user={user} onUpdate={refreshData} />

      <TransactionHistory transactions={transactions} />
    </div>
  );
}
