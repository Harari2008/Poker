import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, DollarSign } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

export default function RecentGames({ games, currentUserEmail }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "waiting": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "active": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "results_pending": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "completed": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "waiting": return "ממתין לשחקנים";
      case "active": return "פעיל";
      case "results_pending": return "ממתין לתוצאות";
      case "completed": return "הושלם";
      default: return status;
    }
  };

  if (games.length === 0) {
    return (
      <Card className="bg-black/20 border-gray-700/50">
        <CardContent className="p-6 text-center">
          <div className="text-gray-400 mb-2">🎲</div>
          <p className="text-gray-400">עדיין אין משחקים</p>
          <p className="text-sm text-gray-500">צור משחק ראשון כדי להתחיל!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-white">משחקים אחרונים</h3>
      <div className="space-y-3">
        {games.slice(0, 5).map((game) => (
          <Card key={game.id} className="bg-black/20 border-gray-700/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-white">{game.title}</h4>
                <Badge className={getStatusColor(game.status)}>
                  {getStatusLabel(game.status)}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-400">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4" />
                  <span>₪{game.buy_in_amount}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  <span>{game.participants?.length || 0}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{format(new Date(game.created_date), "dd/MM", { locale: he })}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
