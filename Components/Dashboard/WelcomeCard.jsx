import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Star, Wallet } from "lucide-react";

export default function WelcomeCard({ user }) {
  return (
    <Card className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-amber-500/20">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">
              שלום, {user?.nickname || user?.full_name}! 🎯
            </h2>
            <p className="text-gray-300">
              מוכן למשחק הבא?
            </p>
          </div>
          <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
            <Trophy className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <div className="mt-4 flex items-center gap-4">
          <div className="flex items-center gap-1">
            <Wallet className="w-4 h-4 text-green-400" />
            <span className="text-sm text-gray-300">יתרה: ₪{(user?.balance || 0).toLocaleString()}</span>
          </div>
          <div className="w-px h-4 bg-gray-600"></div>
          <div className="text-sm text-gray-300">
            {user?.total_games || 0} משחקים
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
