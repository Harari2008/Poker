
import React, { useState, useEffect } from "react";
import { Game, User, Transaction } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Users, DollarSign, Trophy, CheckCircle, Copy, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format, parseISO, isValid } from "date-fns";
import { he } from "date-fns/locale";

import ParticipantsList from "../components/active-game/ParticipantsList";
import GameResults from "../components/active-game/GameResults";
import DiscountRequestDialog from "../components/active-game/DiscountRequestDialog";

export default function ActiveGame() {
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showDiscountDialog, setShowDiscountDialog] = useState(false);

  useEffect(() => {
    loadGameData();
  }, []);

  // Safe date formatting function
  const formatGameDate = (dateString) => {
    if (!dateString) return "לא זמין";
    
    try {
      let date;
      
      if (typeof dateString === 'string') {
        date = parseISO(dateString);
      } else {
        date = new Date(dateString);
      }
      
      if (!isValid(date)) {
        return "תאריך לא תקין";
      }
      
      return format(date, "dd/MM/yyyy HH:mm", { locale: he });
    } catch (error) {
      console.error("Date formatting error:", error);
      return "תאריך לא תקין";
    }
  };

  const loadGameData = async () => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const gameId = urlParams.get('id');
      
      if (!gameId) {
        navigate(createPageUrl("Games"));
        return;
      }

      const currentUser = await User.me();
      const gameData = await Game.get(gameId);
      
      if (!gameData) {
        alert("המשחק לא נמצא");
        navigate(createPageUrl("Games"));
        return;
      }

      setGame(gameData);
      setUser(currentUser);
    } catch (error) {
      console.error("Error loading game:", error);
      navigate(createPageUrl("Games"));
    } finally {
      setIsLoading(false);
    }
  };

  const copyInviteLink = async () => {
    const inviteLink = `${window.location.origin}${createPageUrl("JoinGame")}?gameId=${game.id}`;
    await navigator.clipboard.writeText(inviteLink);
    alert("קישור ההזמנה הועתק!");
  };

  const startGame = async () => {
    try {
      await Game.update(game.id, { status: "active" });
      loadGameData();
    } catch (error) {
      alert("שגיאה בהפעלת המשחק");
    }
  };

  const endGame = async () => {
    try {
      await Game.update(game.id, { status: "results_pending" });
      loadGameData();
    } catch (error) {
      alert("שגיאה בסיום המשחק");
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

  const isHost = game.host_email === user?.email;
  const userParticipant = game.participants?.find(p => p.email === user?.email);
  const canManageResults = game.status === "results_pending";

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate(createPageUrl("Games"))}
          className="border-gray-600"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{game.title}</h1>
          <p className="text-gray-400">
            נוצר ב-{formatGameDate(game.game_date || game.created_date)}
          </p>
        </div>
        <Badge className={getStatusColor(game.status)}>
          {getStatusLabel(game.status)}
        </Badge>
      </div>

      {/* Game Info */}
      <Card className="bg-black/20 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            פרטי המשחק
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-gray-400 text-sm">סכום קנייה</p>
                <p className="text-white font-bold text-xl">₪{game.buy_in_amount.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <div>
                <p className="text-gray-400 text-sm">משתתפים</p>
                <p className="text-white font-bold text-xl">{game.participants?.length || 0}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-green-400" />
            <div>
              <p className="text-gray-400 text-sm">סה״כ קופה</p>
              <p className="text-white font-bold text-xl">
                ₪{((game.participants?.length || 0) * game.buy_in_amount).toLocaleString()}
              </p>
            </div>
          </div>

          {/* Host Actions */}
          {isHost && (
            <div className="flex gap-2 pt-4 border-t border-gray-700">
              {game.status === "waiting" && (
                <>
                  <Button
                    onClick={copyInviteLink}
                    variant="outline"
                    className="flex-1 border-gray-600"
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    העתק קישור הזמנה
                  </Button>
                  <Button
                    onClick={startGame}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    התחל משחק
                  </Button>
                </>
              )}
              
              {game.status === "active" && (
                <Button
                  onClick={endGame}
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  סיים משחק
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Participants List */}
      <ParticipantsList 
        game={game} 
        currentUser={user} 
        onUpdate={loadGameData}
        onSendFriendRequest={() => {
          // Optional: refresh user data to update friends list
          loadGameData();
        }}
      />

      {/* Results Section */}
      {canManageResults && (
        <GameResults
          game={game}
          currentUser={user}
          isHost={isHost}
          onUpdate={loadGameData}
        />
      )}

      {/* User Actions */}
      {!isHost && userParticipant && game.status === "waiting" && (
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-blue-400" />
              <div className="flex-1">
                <p className="text-blue-300 font-medium">רוצה להכנס על סכום נמוך יותר?</p>
                <p className="text-blue-200 text-sm">בקש הנחה ממנהל המשחק</p>
              </div>
              <Button
                onClick={() => setShowDiscountDialog(true)}
                variant="outline"
                className="border-blue-500/50 text-blue-300"
              >
                בקש הנחה
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <DiscountRequestDialog
        open={showDiscountDialog}
        onOpenChange={setShowDiscountDialog}
        game={game}
        user={user}
        onUpdate={loadGameData}
      />
    </div>
  );

  function getStatusColor(status) {
    switch (status) {
      case "waiting": return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "active": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "results_pending": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "completed": return "bg-gray-500/20 text-gray-400 border-gray-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  }

  function getStatusLabel(status) {
    switch (status) {
      case "waiting": return "ממתין לשחקנים";
      case "active": return "פעיל";
      case "results_pending": return "ממתין לתוצאות";
      case "completed": return "הושלם";
      default: return status;
    }
  }
}
