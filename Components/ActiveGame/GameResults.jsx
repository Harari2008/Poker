import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, DollarSign, Award } from "lucide-react";

export default function GameResults({
  results,
  onResultChange,
  isSaving,
  onSaveResults,
  isHost,
  game
}) {

  const totalFinalAmount = results.reduce((sum, r) => sum + r.final_amount, 0);
  const totalBuyIn = results.reduce((sum, r) => sum + r.buy_in, 0);
  const isBalanced = Math.abs(totalFinalAmount - totalBuyIn) < 0.01;

  return (
    <Card className="bg-black/20 border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-amber-400" />
          סיכום תוצאות
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {results.map((result, index) => {
          const profit = result.final_amount - result.buy_in;
          return (
            <div key={result.email} className="p-3 bg-gray-800/50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <Label className="text-white font-semibold">{result.nickname}</Label>
                <div className={`font-bold ${profit >= 0 ? "text-green-400" : "text-red-400"}`}>
                  {profit >= 0 ? "+" : ""}₪{profit.toLocaleString()}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">קנייה: ₪{result.buy_in}</span>
                <Input
                  type="number"
                  placeholder="סכום סופי"
                  value={result.final_amount}
                  onChange={(e) => onResultChange(index, parseFloat(e.target.value) || 0)}
                  className="bg-gray-800 border-gray-600 text-white text-left"
                  disabled={!isHost}
                />
              </div>
            </div>
          );
        })}

        <div className={`mt-4 p-3 rounded-lg text-center font-semibold ${isBalanced ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
          {isBalanced ? "התוצאות מאוזנות" : `הפרש: ₪${(totalFinalAmount - totalBuyIn).toLocaleString()}`}
        </div>
        
        <div className="mt-6">
          {isHost ? (
            <Button
              onClick={onSaveResults}
              disabled={isSaving || !isBalanced}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
            >
              {isSaving ? "מעבד..." : "אשר תוצאות וסיים משחק"}
            </Button>
          ) : (
            <div className="text-center text-gray-400 p-4 bg-gray-800/50 rounded-lg">
              ממתין לאישור התוצאות על ידי מנהל המשחק...
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
