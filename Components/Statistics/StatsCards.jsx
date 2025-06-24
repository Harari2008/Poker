import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Trophy, Target, DollarSign } from "lucide-react";

export default function StatsCards({ stats }) {
  const cards = [
    {
      title: "סה״כ רווחים",
      value: `₪${stats.totalWinnings.toLocaleString()}`,
      icon: DollarSign,
      color: stats.totalWinnings >= 0 ? "text-green-400" : "text-red-400",
      bg: stats.totalWinnings >= 0 ? "bg-green-500/10" : "bg-red-500/10"
    },
    {
      title: "משחקים",
      value: stats.totalGames,
      icon: Target,
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    {
      title: "אחוז זכיות",
      value: `${stats.winRate.toFixed(1)}%`,
      icon: stats.winRate >= 50 ? TrendingUp : TrendingDown,
      color: stats.winRate >= 50 ? "text-green-400" : "text-red-400",
      bg: stats.winRate >= 50 ? "bg-green-500/10" : "bg-red-500/10"
    },
    {
      title: "הזכייה הגדולה",
      value: `₪${stats.biggestWin.toLocaleString()}`,
      icon: Trophy,
      color: "text-amber-400",
      bg: "bg-amber-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, index) => (
        <Card key={index} className={`${card.bg} border-gray-700/50`}>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className={`w-10 h-10 rounded-full ${card.bg} flex items-center justify-center mb-2`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div className="text-lg font-bold text-white">{card.value}</div>
              <div className="text-xs text-gray-400">{card.title}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
