import React, { useState, useEffect } from "react";
import { Game, User, Transaction } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { ArrowRight, Users, Coins, Copy, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function NewGame() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const [gameData, setGameData] = useState({
    title: "",
    buy_in_amount: ""
  });
  const [createdGame, setCreatedGame] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const handleInputChange = (field, value) => {
    setGameData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Generate random 6-character game code
  const generateGameCode = () => {
    const chars = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    let result = '';
    for (let i = 0; i < 6; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
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
      const gameCode = generateGameCode();
      
      const newGame = await Game.create({
        title: gameData.title,
        buy_in_amount: buyInAmount,
        host_email: user.email,
        game_date: new Date().toISOString(),
        game_code: gameCode,
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
      
      setCreatedGame(newGame);
    } catch (error) {
      console.error("Error creating game:", error);
      alert("שגיאה ביצירת המשחק");
    } finally {
      setIsCreating(false);
    }
  };

  const copyInviteLink = async () => {
    const inviteLink = `${window.location.origin}${createPageUrl("JoinGame")}?gameId=${createdGame.id}`;
    await navigator.clipboard.writeText(inviteLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  if (createdGame) {
    return (
      <div className="p-4">
        <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
          <CardHeader>
            <CardTitle className="text-white text-center">
              🎉 המשחק נוצר בהצלחה!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-white mb-2">{createdGame.title}</h3>
              <p className="text-gray-300">סכום כניסה: ₪{createdGame.buy_in_amount}</p>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-center">
              <Label className="text-amber-300 font-semibold text-sm">קוד המשחק</Label>
              <div className="text-3xl font-bold text-amber-400 mt-2 tracking-wider">
                {createdGame.game_code}
              </div>
              <p className="text-xs text-amber-200 mt-2">
                שתף קוד זה עם חברים כדי שיוכלו להצטרף
              </p>
            </div>

            <div className="bg-black/20 rounded-lg p-4">
              <Label className="text-white font-semibold">קישור הזמנה לחברים:</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={`${window.location.origin}${createPageUrl("JoinGame")}?gameId=${createdGame.id}`}
                  readOnly
                  className="bg-gray-800 text-white border-gray-600"
                />
                <Button
                  onClick={copyInviteLink}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  {linkCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </Button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                שלח קישור זה או את הקוד לחברים שלך כדי שיוכלו להצטרף למשחק
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => navigate(createPageUrl("Dashboard"))}
                className="flex-1 bg-gray-600 hover:bg-gray-700"
              >
                חזרה לדשבורד
              </Button>
              <Button
                onClick={() => navigate(createPageUrl(`ActiveGame?id=${createdGame.id}`))}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                לדף המשחק
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">משחק חדש</h1>
        <p className="text-gray-400">צור משחק פוקר חדש והזמן את החברים שלך</p>
      </div>

      <Card className="bg-black/20 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            פרטי המשחק
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">שם המשחק *</Label>
            <Input
              placeholder="לדוגמה: משחק חמישי אצל דני"
              value={gameData.title}
              onChange={(e) => handleInputChange("title", e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white flex items-center gap-2">
              <Coins className="w-4 h-4 text-amber-400" />
              סכום כניסה (₪) *
            </Label>
            <Input
              type="number"
              placeholder="100"
              value={gameData.buy_in_amount}
              onChange={(e) => handleInputChange("buy_in_amount", e.target.value)}
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          {user && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <p className="text-green-300 text-sm">
                💰 <strong>היתרה שלך:</strong> ₪{(user.balance || 0).toLocaleString()}
              </p>
              {(user.balance || 0) < parseFloat(gameData.buy_in_amount || 0) && (
                <p className="text-red-400 text-xs mt-1">
                  ⚠️ אין מספיק כסף ביתרה עבור המשחק הזה
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-6">
        <Button
          onClick={createGame}
          disabled={isCreating || !gameData.title || !gameData.buy_in_amount}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold py-3"
        >
          {isCreating ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              יוצר משחק...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              צור משחק
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </Button>
      </div>
    </div>
  );
}
