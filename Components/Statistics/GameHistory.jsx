
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

export default function GameHistory({ results }) {
  if (results.length === 0) {
    return (
      <Card className="bg-black/20 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white">היסטוריית משחקים</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 py-8">
            <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>אין נתונים לתקופה הנבחרת</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/20 border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white">היסטוריית משחקים</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {results.slice(0, 10).map((result) => (
          <div key={result.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                result.profit_loss >= 0 ? "bg-green-500/20" : "bg-red-500/20"
              }`}>
                {result.profit_loss >= 0 ? 
                  <TrendingUp className="w-4 h-4 text-green-400" /> :
                  <TrendingDown className="w-4 h-4 text-red-400" />
                }
              </div>
              <div>
                <p className="text-white font-medium">
                  {format(new Date(result.created_date), "dd/MM/yyyy", { locale: he })}
                </p>
                <p className="text-xs text-gray-400">כניסה: ₪{result.buy_in}</p>
              </div>
            </div>
            <Badge className={`${
              result.profit_loss >= 0 
                ? "bg-green-500/20 text-green-400 border-green-500/30" 
                : "bg-red-500/20 text-red-400 border-red-500/30"
            }`}>
              {result.profit_loss >= 0 ? "+" : ""}₪{result.profit_loss}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

