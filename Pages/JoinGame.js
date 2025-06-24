
import React, { useState, useEffect } from "react";
import { Game, User, Transaction } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, Calendar, MapPin, Check, Wallet, Coins } from "lucide-react"; // Added Coins
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { he } from "date-fns/locale";

export default function JoinGame() {
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [user, setUser] = useState(null);
  const [isJoining, setIsJoining] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    loadGameData();
  }, []);

  const loadGameData = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const gameId = urlParams.get('gameId');
      
      if (!gameId) {
        alert("מזהה משחק לא תקין");
        navigate(createPageUrl("Dashboard"));
        return;
      }

      const currentUser = await User.me();
      const gameData = await Game.get(gameId);
      
      if (!gameData) {
        alert("המשחק לא נמצא");
        navigate(createPageUrl("Dashboard"));
        return;
      }

      const userAlreadyJoined = gameData.participants?.some(p => p.email === currentUser.email);
      
      setGame(gameData);
      setUser(currentUser);
      setHasJoined(userAlreadyJoined);
    } catch (error) {
      console.error("Error loading game:", error);
      alert("שגיאה בטעינת המשחק");
      navigate(createPageUrl("Dashboard"));
    } finally {
      setIsLoading(false);
    }
  };

  const joinGame = async () => {
    if (!user || !game) return;

    // Check if user has sufficient balance
    if ((user.balance || 0) < game.buy_in_amount) {
      alert(`אין מספיק כסף ביתרה. יתרה נוכחית: ₪${(user.balance || 0).toLocaleString()}`);
      return;
    }

    setIsJoining(true);
    try {
      // Add user to game participants
      const updatedParticipants = [
        ...(game.participants || []),
        {
          email: user.email,
          nickname: user.nickname || user.full_name,
          paid: true,
          result: 0,
          result_confirmed: false
        }
      ];

      await Game.update(game.id, {
        participants: updatedParticipants
      });

      // Deduct buy-in from user balance
      await User.updateMyUserData({
        balance: (user.balance || 0) - game.buy_in_amount
      });

      // Create transaction record
      await Transaction.create({
        user_email: user.email,
        type: "game_payment",
        amount: -game.buy_in_amount,
        description: `תשלום עבור משחק: ${game.title}`,
        game_id: game.id
      });

      setHasJoined(true);
      loadGameData(); // Refresh game data
    } catch (error) {
      console.error("Error joining game:", error);
      alert("שגיאה בהצטרפות למשחק");
    } finally {
      setIsJoining(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="p-4 text-center">
        <p className="text-white">המשחק לא נמצא</p>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white mb-2">הצטרפות למשחק</h1>
        <p className="text-gray-400">הוזמנת להצטרף למשחק פוקר</p>
      </div>

      <Card className="bg-black/20 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white text-xl">{game.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-gray-400 text-sm">כניסה</p>
                <p className="text-white font-bold">₪{game.buy_in_amount.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-gray-400 text-sm">שחקנים</p>
                <p className="text-white font-bold">{game.participants?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-gray-400 text-sm">נוצר</p>
              <p className="text-white">
                {format(new Date(game.game_date), "dd/MM/yyyy HH:mm", { locale: he })}
              </p>
            </div>
          </div>

          {game.location && (
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-400" />
              <div>
                <p className="text-gray-400 text-sm">מיקום</p>
                <p className="text-white">{game.location}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* User Balance */}
      <Card className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-amber-400" />
              <span className="text-white">היתרה שלך:</span>
            </div>
            <span className="text-2xl font-bold text-white">
              ₪{(user?.balance || 0).toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Participants */}
      {game.participants && game.participants.length > 0 && (
        <Card className="bg-black/20 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white">משתתפים ({game.participants.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {game.participants.map((participant, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                <span className="text-white">{participant.nickname}</span>
                {participant.paid && (
                  <Badge className="bg-green-500/20 text-green-400">
                    <Check className="w-3 h-3 mr-1" />
                    שילם
                  </Badge>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Action Button */}
      <div className="space-y-3">
        {hasJoined ? (
          <div className="text-center">
            <div className="text-green-400 mb-4">
              <Check className="w-16 h-16 mx-auto mb-2" />
              <p className="text-xl font-bold">הצטרפת בהצלחה!</p>
            </div>
            <Button
              onClick={() => navigate(createPageUrl("Dashboard"))}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              חזרה לדשבורד
            </Button>
          </div>
        ) : (
          <>
            {(user?.balance || 0) < game.buy_in_amount && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-center">
                <p className="text-red-400 font-medium">אין מספיק כסף ביתרה</p>
                <p className="text-gray-400 text-sm mt-1">
                  נדרש: ₪{game.buy_in_amount.toLocaleString()} | 
                  יתרה: ₪{(user?.balance || 0).toLocaleString()}
                </p>
                <Button
                  onClick={() => navigate(createPageUrl("Settings"))}
                  className="mt-3 bg-green-600 hover:bg-green-700"
                >
                  הפקד כסף
                </Button>
              </div>
            )}
            
            <Button
              onClick={joinGame}
              disabled={isJoining || (user?.balance || 0) < game.buy_in_amount}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3"
            >
              {isJoining ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  מצטרף...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  הצטרף למשחק - ₪{game.buy_in_amount.toLocaleString()}
                  <Check className="w-4 h-4" />
                </div>
              )}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
