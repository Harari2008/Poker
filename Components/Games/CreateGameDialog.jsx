
import React, { useState } from "react";
import { Game, User, Transaction } from "@/entities/all";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Coins, Wallet } from "lucide-react"; // Changed DollarSign to Coins

export default function CreateGameDialog({ open, onOpenChange, user, onGameCreated }) {
  const [gameData, setGameData] = useState({
    title: "",
    buy_in_amount: ""
  });
  const [isCreating, setIsCreating] = useState(false);

  const handleInputChange = (field, value) => {
    setGameData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const createGame = async () => {
    if (!gameData.title || !gameData.buy_in_amount) {
      alert("נא למלא את כל השדות הנדרשים");
      return;
    }

    const buyInAmount = parseFloat(gameData.buy_in_amount);
    
    if ((user?.balance || 0) < buyInAmount) {
      alert(`אין מספיק כסף ביתרה. יתרה נוכחית: ₪${(user?.balance || 0).toLocaleString()}`);
      return;
    }

    setIsCreating(true);
    try {
      const newGame = await Game.create({
        title: gameData.title,
        buy_in_amount: buyInAmount,
        host_email: user.email,
        game_date: new Date().toISOString(),
        participants: [{
          email: user.email,
          nickname: user.nickname || user.full_name,
          paid: true,
          result: 0,
          result_confirmed: false
        }]
      });

      await User.updateMyUserData({
        balance: (user.balance || 0) - buyInAmount
      });

      await Transaction.create({
        user_email: user.email,
        type: "game_payment",
        amount: -buyInAmount,
        description: `תשלום עבור משחק: ${gameData.title}`,
        game_id: newGame.id
      });

      setGameData({ title: "", buy_in_amount: "" });
      onOpenChange(false);
      onGameCreated();
      alert("המשחק נוצר בהצלחה!");
    } catch (error) {
      console.error("Error creating game:", error);
      alert("שגיאה ביצירת המשחק");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-green-400" />
            משחק חדש
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">שם המשחק</Label>
            <Input
              placeholder="לדוגמה: משחק חמישי אצל דני"
              value={gameData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" /> {/* Changed icon from DollarSign to Coins */}
              סכום כניסה (₪) {/* Changed text from "סכום קנייה (₪)" to "סכום כניסה (₪)" */}
            </Label>
            <Input
              type="number"
              placeholder="100"
              value={gameData.buy_in_amount}
              onChange={(e) => handleInputChange("buy_in_amount", e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="w-4 h-4 text-green-400" />
              <span className="text-green-300 font-medium">היתרה שלך</span>
            </div>
            <p className="text-2xl font-bold text-white">₪{(user?.balance || 0).toLocaleString()}</p>
            {(user?.balance || 0) < parseFloat(gameData.buy_in_amount || 0) && (
              <p className="text-red-400 text-sm mt-2">
                ⚠️ אין מספיק כסף ביתרה עבור המשחק הזה
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              onClick={createGame}
              disabled={isCreating || !gameData.title || !gameData.buy_in_amount}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              {isCreating ? "יוצר..." : "צור משחק"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-600"
            >
              ביטול
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

