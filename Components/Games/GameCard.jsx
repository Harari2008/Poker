
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, DollarSign, Calendar, Settings, Eye, Copy, Trophy, Coins } from "lucide-react"; // Added Coins
import { format, isValid, parseISO } from "date-fns";
import { he } from "date-fns/locale";
import { createPageUrl } from "@/utils";

export default function GameCard({ game, currentUser, onUpdate, onNavigate, isCompleted = false }) {
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

  const copyInviteLink = async () => {
    const inviteLink = `${window.location.origin}${createPageUrl("JoinGame")}?gameId=${game.id}`;
    await navigator.clipboard.writeText(inviteLink);
    alert("קישור ההזמנה הועתק!");
  };

  const inviteFriend = async () => {
    // Show friend selection dialog for inviting to game
    alert("תכונה זו תהיה זמינה בקרוב - הזמנת חברים ישירות למשחק");
  };

  // Safe date formatting
  const formatGameDate = (dateString) => {
    if (!dateString) return "לא זמין";
    
    try {
      let date;
      
      // Try to parse as ISO string first
      if (typeof dateString === 'string') {
        date = parseISO(dateString);
      } else {
        date = new Date(dateString);
      }
      
      // Check if date is valid
      if (!isValid(date)) {
        return "תאריך לא תקין";
      }
      
      return format(date, "dd/MM", { locale: he });
    } catch (error) {
      console.error("Date formatting error:", error, "Date string:", dateString);
      return "תאריך לא תקין";
    }
  };

  const isHost = game.host_email === currentUser?.email;
  const userParticipant = game.participants?.find(p => p.email === currentUser?.email);
  const myResult = userParticipant?.result || 0;

  return (
    <Card className="bg-black/20 border-gray-700/50 hover:bg-black/30 transition-colors">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white">{game.title}</CardTitle>
          <Badge className={getStatusColor(game.status)}>
            {getStatusLabel(game.status)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-amber-400" /> {/* Changed icon from DollarSign to Coins */}
            <div>
              <p className="text-gray-400 text-xs">כניסה</p> {/* Changed label from "קנייה" to "כניסה" */}
              <p className="text-white font-bold">₪{game.buy_in_amount?.toLocaleString() || 0}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400" />
            <div>
              <p className="text-gray-400 text-xs">שחקנים</p>
              <p className="text-white font-bold">{game.participants?.length || 0}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-green-400" />
            <div>
              <p className="text-gray-400 text-xs">נוצר</p>
              <p className="text-white font-bold">
                {formatGameDate(game.game_date || game.created_date)}
              </p>
            </div>
          </div>
        </div>

        {/* Show user's result if completed */}
        {isCompleted && myResult !== 0 && (
          <div className="bg-gray-800/50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span className="text-gray-300 text-sm">התוצאה שלך:</span>
              <span className={`font-bold ${myResult > 0 ? 'text-green-400' : 'text-red-400'}`}>
                {myResult > 0 ? '+' : ''}₪{myResult.toLocaleString()}
              </span>
            </div>
          </div>
        )}

        {/* Show some participants */}
        {game.participants && game.participants.length > 0 && (
          <div className="space-y-2">
            <p className="text-gray-400 text-sm">משתתפים:</p>
            <div className="flex flex-wrap gap-2">
              {game.participants.slice(0, 3).map((participant, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {participant.nickname}
                  {participant.email === currentUser?.email && " (אתה)"}
                  {participant.email === game.host_email && " 👑"}
                </Badge>
              ))}
              {game.participants.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{game.participants.length - 3} נוספים
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {!isCompleted && (
            <>
              <Button
                onClick={() => onNavigate && onNavigate(game.id)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <Eye className="w-4 h-4 mr-2" />
                {isHost ? "נהל משחק" : "צפה במשחק"}
              </Button>
              
              {isHost && game.status === "waiting" && (
                <div className="flex gap-1">
                  <Button
                    onClick={copyInviteLink}
                    variant="outline"
                    size="icon"
                    className="border-gray-600"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={inviteFriend}
                    variant="outline"
                    size="icon"
                    className="border-amber-600 text-amber-400 hover:bg-amber-500/10"
                  >
                    <Users className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </>
          )}
          
          {isCompleted && (
            <Button
              onClick={() => onNavigate && onNavigate(game.id)}
              variant="outline"
              className="flex-1 border-gray-600"
            >
              <Eye className="w-4 h-4 mr-2" />
              צפה בתוצאות
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

