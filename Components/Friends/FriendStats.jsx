import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Trophy, Target, TrendingUp } from "lucide-react";

export default function FriendStats({ friends }) {
  const totalFriends = friends.length;
  const activeFriends = friends.filter(f => (f.total_games || 0) > 0).length;
  const topWinner = friends.reduce((top, friend) => 
    (friend.total_winnings || 0) > (top?.total_winnings || 0) ? friend : top
  , null);

  const stats = [
    {
      title: "סך חברים",
      value: totalFriends,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10"
    },
    {
      title: "פעילים",
      value: activeFriends,
      icon: TrendingUp,
      color: "text-green-400", 
      bg: "bg-green-500/10"
    },
    {
      title: "זוכה מוביל",
      value: topWinner?.nickname || "אין",
      icon: Trophy,
      color: "text-amber-400",
      bg: "bg-amber-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat, index) => (
        <Card key={index} className={`${stat.bg} border-gray-700/50`}>
          <CardContent className="p-4">
            <div className="flex flex-col items-center text-center">
              <div className={`w-8 h-8 rounded-full ${stat.bg} flex items-center justify-center mb-2`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className="text-sm font-bold text-white truncate w-full">{stat.value}</div>
              <div className="text-xs text-gray-400">{stat.title}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}#
