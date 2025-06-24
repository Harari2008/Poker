import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History, ArrowDownToLine, ArrowUpFromLine, ShieldMinus, ShieldPlus, Gamepad2 } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

export default function TransactionHistory({ transactions }) {
  const getTransactionIcon = (type) => {
    const props = { className: "w-5 h-5" };
    switch (type) {
      case "deposit": return <ArrowDownToLine {...props} />;
      case "withdrawal": return <ArrowUpFromLine {...props} />;
      case "game_payment": return <ShieldMinus {...props} />;
      case "game_winnings": return <ShieldPlus {...props} />;
      default: return <Gamepad2 {...props} />;
    }
  };

  return (
    <Card className="bg-black/20 border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <History className="w-5 h-5 text-amber-400" />
          היסטוריית עסקאות
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {transactions && transactions.length > 0 ? (
          transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${tx.amount > 0 ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"}`}>
                  {getTransactionIcon(tx.type)}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium truncate max-w-[150px] sm:max-w-xs">{tx.description}</p>
                  <p className="text-gray-400 text-xs">
                    {format(new Date(tx.created_date), "dd/MM/yyyy HH:mm", { locale: he })}
                  </p>
                </div>
              </div>
              <div className={`font-bold text-lg ${tx.amount >= 0 ? "text-green-400" : "text-red-400"}`}>
                {tx.amount > 0 ? '+' : ''}₪{tx.amount.toLocaleString()}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center text-gray-400 py-4">
            <p>אין היסטוריית עסקאות להצגה.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
