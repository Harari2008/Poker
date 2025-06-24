
import React, { useState, useEffect } from "react";
import { Game, User } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Users, DollarSign, Calendar, Trophy, Play, Hash, Search } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { he } from "date-fns/locale";

import CreateGameDialog from "../components/games/CreateGameDialog";
import GameCard from "../components/games/GameCard";

export default function Games() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [gameCode, setGameCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      const allGames = await Game.filter({}, "-created_date");
      
      // Filter games where user is participant or host
      const userGames = allGames.filter(game => 
        game.host_email === currentUser.email ||
        game.participants?.some(p => p.email === currentUser.email)
      );
      
      setUser(currentUser);
      setGames(userGames);
    } catch (error) {
      console.error("Error loading games:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const joinGameByCode = async () => {
    if (!gameCode.trim()) {
      alert("נא להכניס קוד משחק");
      return;
    }

    setIsSearching(true);
    try {
      const games = await Game.filter({ game_code: gameCode.trim().toUpperCase() });
      
      if (games.length === 0) {
        alert("לא נמצא משחק עם הקוד הזה");
        return;
      }

      const game = games[0];
      
      if (game.status === "completed") {
        alert("המשחק הזה כבר הסתיים");
        return;
      }

      // Navigate to join game page
      navigate(createPageUrl(`JoinGame?gameId=${game.id}`));
      setShowJoinDialog(false);
      setGameCode("");
    } catch (error) {
      console.error("Error joining game:", error);
      alert("שגיאה בחיפוש המשחק");
    } finally {
      setIsSearching(false);
    }
  };

  const activeGames = games.filter(game => 
    game.status === "waiting" || game.status === "active" || game.status === "results_pending"
  );
  
  const completedGames = games.filter(game => game.status === "completed");

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">המשחקים שלי</h1>
          <p className="text-gray-400">נהל את המשחקים שלך</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setShowJoinDialog(true)}
            variant="outline"
            className="border-amber-500/50 text-amber-400 hover:bg-amber-500/10 flex items-center gap-2"
          >
            <Hash className="w-4 h-4" />
            הצטרף עם קוד
          </Button>
          <Button
            onClick={() => setShowCreateDialog(true)}
            className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            משחק חדש
          </Button>
        </div>
      </div>

      {/* Join Game Dialog */}
      <Dialog open={showJoinDialog} onOpenChange={setShowJoinDialog}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Hash className="w-5 h-5 text-orange-400" />
              הצטרף למשחק
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">קוד המשחק</Label>
              <Input
                value={gameCode}
                onChange={(e) => setGameCode(e.target.value.toUpperCase())}
                placeholder="הכנס קוד (לדוגמה: ABC123)"
                className="bg-gray-800 border-gray-600 text-white uppercase text-center text-lg tracking-wider"
                maxLength={6}
              />
              <p className="text-xs text-gray-400 text-center">
                הקוד מורכב מ-6 תווים (אותיות ומספרים)
              </p>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={joinGameByCode}
                disabled={isSearching || !gameCode.trim()}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {isSearching ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    מחפש...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    חפש משחק
                  </div>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowJoinDialog(false);
                  setGameCode("");
                }}
                className="border-gray-600"
              >
                ביטול
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="active" className="space-y-4">
        <TabsList className="bg-gray-800 border-gray-700">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Play className="w-4 h-4" />
            פעילים ({activeGames.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            הושלמו ({completedGames.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          {activeGames.length === 0 ? (
            <Card className="bg-black/20 border-gray-700/50">
              <CardContent className="p-8 text-center">
                <Play className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400 text-lg mb-2">אין משחקים פעילים</p>
                <p className="text-gray-500 mb-4">צור משחק חדש כדי להתחיל!</p>
                <Button
                  onClick={() => setShowCreateDialog(true)}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  משחק חדש
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {activeGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  currentUser={user}
                  onUpdate={loadData}
                  onNavigate={(gameId) => navigate(createPageUrl(`ActiveGame?id=${gameId}`))}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4">
          {completedGames.length === 0 ? (
            <Card className="bg-black/20 border-gray-700/50">
              <CardContent className="p-8 text-center">
                <Trophy className="w-16 h-16 mx-auto text-gray-500 mb-4" />
                <p className="text-gray-400 text-lg">אין משחקים שהושלמו</p>
                <p className="text-gray-500">משחקים שהושלמו יופיעו כאן</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {completedGames.map((game) => (
                <GameCard
                  key={game.id}
                  game={game}
                  currentUser={user}
                  onUpdate={loadData}
                  isCompleted={true}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <CreateGameDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        user={user}
        onGameCreated={loadData}
      />
    </div>
  );
}
