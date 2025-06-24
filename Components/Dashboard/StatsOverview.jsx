import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, Target } from "lucide-react";

export default function StatsOverview({ user, games }) {
  const totalWinnings = user?.total_winnings || 0;
  const totalGames = user?.total_games || 0;
  const winRate = totalGames > 0 ? ((totalWinnings > 0 ? 1 : 0) * 100) : 0;

  const stats = [
    {
      title: "סה״כ רווחים",
      value: `₪${totalWinnings.toLocaleString()}`,
      icon: DollarSign,
      trend: totalWinnings >= 0 ? "up" : "down",
      bgColor: totalWinnings >= 0 ? "bg-green-500/10" : "bg-red-500/10",
      iconColor: totalWinnings >= 0 ? "text-green-400" : "text-red-400"
    },
    {
      title: "משחקים",
      value: totalGames,
      icon: Target,
      bgColor: "bg-blue-500/10",
      iconColor: "text-blue-400"
    },
    {
      title: "אחוז זכיות",
      value: `${winRate.toFixed(0)}%`,
      icon: totalWinnings >= 0 ? TrendingUp : TrendingDown,
      bgColor: "bg-purple-500/10", 
      iconColor: "text-purple-400"
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, index) => (
        <Card key={index} className={`${stat.bgColor} border-gray-700/50 backdrop-blur-sm`}>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className={`w-10 h-10 rounded-full ${stat.bgColor} flex items-center justify-center mb-2`}>
                <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
              </div>
              <div className="text-lg font-bold text-white">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.title}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
