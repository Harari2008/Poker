
import React, { useState, useEffect } from "react";
import { User, Game, GameResult } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Trophy, Target, Calendar, DollarSign } from "lucide-react";
import { format, subDays, subMonths, subYears } from "date-fns";
import { he } from "date-fns/locale";

import StatsCards from "../components/statistics/StatsCards";
import GameHistory from "../components/statistics/GameHistory";
import FriendsRanking from "../components/statistics/FriendsRanking";

export default function Statistics() {
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);
  const [results, setResults] = useState([]);
  const [timeRange, setTimeRange] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      // Get games where the user participated or games from friends
      const allGames = await Game.filter({}, "-created_date");
      const userGames = allGames.filter(game =>
        game.participants?.some(p => p.email === currentUser.email) ||
        (currentUser.friends || []).includes(game.host_email)
      );

      const allResults = await GameResult.filter({ player_email: currentUser.email }, "-created_date");

      setUser(currentUser);
      setGames(userGames);
      setResults(allResults);
    } catch (error) {
      console.error("Error loading statistics:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getFilteredData = () => {
    let startDate = new Date(0); // Beginning of time

    switch (timeRange) {
      case "week":
        startDate = subDays(new Date(), 7);
        break;
      case "month":
        startDate = subMonths(new Date(), 1);
        break;
      case "year":
        startDate = subYears(new Date(), 1);
        break;
    }

    const filteredResults = results.filter(result =>
      new Date(result.created_date) >= startDate
    );

    return filteredResults;
  };

  const calculateStats = () => {
    const filteredResults = getFilteredData();

    const totalGames = filteredResults.length;
    const totalWinnings = filteredResults.reduce((sum, result) => sum + result.profit_loss, 0);
    const wins = filteredResults.filter(result => result.profit_loss > 0).length;
    const winRate = totalGames > 0 ? (wins / totalGames) * 100 : 0;
    const biggestWin = Math.max(...filteredResults.map(r => r.profit_loss), 0);
    const biggestLoss = Math.min(...filteredResults.map(r => r.profit_loss), 0);

    return {
      totalGames,
      totalWinnings,
      winRate,
      biggestWin,
      biggestLoss
    };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  const stats = calculateStats();

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">סטטיסטיקות</h1>
          <p className="text-gray-400">נתח את הביצועים שלך</p>
        </div>

        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40 bg-gray-800 border-gray-600 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">כל הזמן</SelectItem>
            <SelectItem value="week">שבוע אחרון</SelectItem>
            <SelectItem value="month">חודש אחרון</SelectItem>
            <SelectItem value="year">שנה אחרונה</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <StatsCards stats={stats} />

      <div className="grid lg:grid-cols-2 gap-6">
        <GameHistory results={getFilteredData()} />
        <FriendsRanking
          games={games}
          currentUserEmail={user?.email}
          userFriends={user?.friends || []}
        />
      </div>
    </div>
  );
}
