import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Mail, Trophy, Target, UserMinus, Star } from "lucide-react";

export default function FriendsList({ friends, onRemoveFriend }) {
  if (friends.length === 0) {
    return (
      <Card className="bg-black/20 border-gray-700/50">
        <CardContent className="p-8 text-center">
          <Users className="w-16 h-16 mx-auto text-gray-500 mb-4" />
          <p className="text-gray-400 text-lg mb-2">אין חברים עדיין</p>
          <p className="text-gray-500">הוסף חברים כדי להתחיל לשחק יחד!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/20 border-gray-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-amber-400" />
          רשימת חברים ({friends.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {friends.map((friend) => (
          <div key={friend.email} className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg hover:bg-gray-800/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                {friend.avatar_url ? (
                  <img src={friend.avatar_url} alt="פרופיל" className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span className="text-white font-bold">
                    {(friend.nickname || friend.full_name)?.charAt(0)?.toUpperCase()}
                  </span>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-semibold">
                    {friend.nickname || friend.full_name}
                  </h3>
                  {(friend.total_winnings || 0) > 0 && (
                    <Star className="w-4 h-4 text-amber-400 fill-current" />
                  )}
                </div>
                <p className="text-gray-400 text-sm flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {friend.email}
                </p>
                
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-1 text-xs">
                    <Target className="w-3 h-3 text-blue-400" />
                    <span className="text-gray-400">{friend.total_games || 0} משחקים</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <Trophy className="w-3 h-3 text-amber-400" />
                    <span className={`${(friend.total_winnings || 0) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ₪{(friend.total_winnings || 0).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onRemoveFriend(friend.email)}
              className="border-red-500/50 text-red-400 hover:bg-red-500/10"
            >
              <UserMinus className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
