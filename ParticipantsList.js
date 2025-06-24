
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Users, Coins, Check, UserPlus, Copy } from "lucide-react"; // Changed DollarSign to Coins
import { FriendRequest, User } from "@/entities/all";

export default function ParticipantsList({ 
  game, 
  currentUser, 
  onUpdate,
  onSendFriendRequest 
}) {
  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);

  const isHost = game.host_email === currentUser?.email;
  const currentUserFriends = currentUser?.friends || [];

  const copyGameCode = async () => {
    if (game.game_code) {
      await navigator.clipboard.writeText(game.game_code);
      setCodeCopied(true);
      setTimeout(() => setCodeCopied(false), 2000);
    }
  };

  const sendFriendRequest = async (participantEmail, participantNickname) => {
    try {
      // Check if request already exists
      const existingRequests = await FriendRequest.filter({
        from_email: currentUser.email,
        to_email: participantEmail,
        status: "pending"
      });

      if (existingRequests.length > 0) {
        alert("כבר נשלחה בקשת חברות למשתתף זה");
        return;
      }

      await FriendRequest.create({
        from_email: currentUser.email,  
        from_nickname: currentUser.nickname || currentUser.full_name,
        from_avatar: currentUser.avatar_url || "",
        to_email: participantEmail
      });

      alert(`בקשת חברות נשלחה ל${participantNickname}`);
      if (onSendFriendRequest) {
        onSendFriendRequest();
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
      alert("שגיאה בשליחת בקשת החברות");
    }
  };

  return (
    <>
      <Card className="bg-black/20 border-gray-700/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              משתתפים ({game.participants?.length || 0})
            </CardTitle>
            {isHost && (
              <Button
                onClick={() => setShowInviteDialog(true)}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <UserPlus className="w-4 h-4 mr-2" />
                הזמן
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {game.participants?.map((participant, index) => {
            const isCurrentUser = participant.email === currentUser?.email;
            const isFriend = currentUserFriends.includes(participant.email);
            const canSendFriendRequest = !isCurrentUser && !isFriend;

            return (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-800/30 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold">
                      {participant.nickname?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium">
                        {participant.nickname}
                        {isCurrentUser && " (אתה)"}
                        {participant.email === game.host_email && " 👑"}
                      </span>
                      {isFriend && (
                        <Badge variant="outline" className="text-xs border-green-500/50 text-green-400">
                          חבר
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-400">
                      <Coins className="w-3 h-3" /> {/* Changed DollarSign to Coins */}
                      <span>₪{game.buy_in_amount?.toLocaleString()}</span>
                      {participant.paid && (
                        <Badge className="bg-green-500/20 text-green-400 text-xs">
                          <Check className="w-3 h-3 mr-1" />
                          שילם
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                
                {canSendFriendRequest && (
                  <Button
                    onClick={() => sendFriendRequest(participant.email, participant.nickname)}
                    size="sm"
                    variant="outline"
                    className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10"
                  >
                    <UserPlus className="w-4 h-4 mr-1" />
                    הוסף חבר
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>

      <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-green-400" />
              הזמן שחקנים למשחק
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {game.game_code && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 text-center">
                <p className="text-amber-300 font-semibold mb-2">קוד המשחק</p>
                <div className="text-2xl font-bold text-amber-400 tracking-wider mb-2">
                  {game.game_code}
                </div>
                <Button
                  onClick={copyGameCode}
                  size="sm"
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  {codeCopied ? <Check className="w-4 h-4 mr-2" /> : <Copy className="w-4 h-4 mr-2" />}
                  {codeCopied ? "הועתק!" : "העתק קוד"}
                </Button>
                <p className="text-xs text-amber-200 mt-2">
                  שתף קוד זה עם חברים כדי שיוכלו להצטרף
                </p>
              </div>
            )}
            
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-white font-semibold mb-2">קישור הזמנה</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={`${window.location.origin}/JoinGame?gameId=${game.id}`}
                  readOnly
                  className="flex-1 bg-gray-700 text-white p-2 rounded text-sm"
                />
                <Button
                  onClick={async () => {
                    await navigator.clipboard.writeText(`${window.location.origin}/JoinGame?gameId=${game.id}`);
                    alert("קישור הועתק!");
                  }}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <Button
              onClick={() => setShowInviteDialog(false)}
              className="w-full bg-gray-600 hover:bg-gray-700"
            >
              סגור
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

