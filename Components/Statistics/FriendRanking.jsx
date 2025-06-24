import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Medal, Award, Users } from "lucide-react";

export default function FriendsRanking({ games, currentUserEmail, userFriends = [] }) {
  // Calculate friend statistics from games - only for actual friends
  const getFriendsStats = () => {
    const friendsMap = new Map();
    
    games.forEach(game => {
      if (game.participants) {
        game.participants.forEach(participant => {
          // Only include actual friends or the current user
          if (participant.email === currentUserEmail || userFriends.includes(participant.email)) {
            if (!friendsMap.has(participant.email)) {
              friendsMap.set(participant.email, {
                email: participant.email,
                nickname: participant.nickname,
                totalGames: 0,
                totalWinnings: 0
              });
            }
            
            const friend = friendsMap.get(participant.email);
            friend.totalGames++;
            friend.totalWinnings += participant.result || 0;
          }
        });
      }
    });

    return Array.from(friendsMap.values())
      .filter(friend => friend.totalGames > 0) // Only show friends who actually played
      .sort((a, b) => b.totalWinnings - a.totalWinnings)
      .slice(0, 10);
  };

  const friendsStats = getFriendsStats();

  const getRankIcon = (index) => {
    switch (index) {
      case 0: return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 1: return <Medal className="w-5 h-5 text-gray-300" />;
      case 2: return <Award className="w-5 h-5 text-amber-600" />;
      default: return <span className="text-gray-400 font-bold">#{index + 1}</span>;
    }
  };

  if (friendsStats.length === 0) {
    return (
      <Card className="bg-black/20 border-gray-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-amber-400" />
            דירוג חברים
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400 py-8">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="mb-2">אין חברים בדירוג</p>
            <p className="text-sm text-gray-500">הוסף חברים ושחק יחד כדי לראות דירוג</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/20 border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-400" />
          דירוג חברים ({friendsStats.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {friendsStats.map((friend, index) => (
          <div 
            key={friend.email} 
            className={`flex items-center justify-between p-3 rounded-lg ${
              friend.email === currentUserEmail ? "bg-amber-500/10 border border-amber-500/30" : "bg-gray-800/30"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 flex items-center justify-center">
                {getRankIcon(index)}
              </div>
              <div>
                <p className={`font-medium ${
                  friend.email === currentUserEmail ? "text-amber-400" : "text-white"
                }`}>
                  {friend.nickname}
                  {friend.email === currentUserEmail && " (אתה)"}
                </p>
                <p className="text-xs text-gray-400">{friend.totalGames} משחקים</p>
              </div>
            </div>
            <div className={`text-left ${
              friend.totalWinnings >= 0 ? "text-green-400" : "text-red-400"
            }`}>
              <span className="font-bold">
                {friend.totalWinnings >= 0 ? "+" : ""}₪{friend.totalWinnings.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
