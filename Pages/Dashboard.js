import React, { useState, useEffect } from "react";
import { User, Game } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Plus, Trophy, TrendingUp, Clock, Users as UsersIcon } from "lucide-react";
import { format } from "date-fns";
import { he } from "date-fns/locale";

import WelcomeCard from "../components/dashboard/WelcomeCard";
import StatsOverview from "../components/dashboard/StatsOverview";
import RecentGames from "../components/dashboard/RecentGames";
import QuickActions from "../components/dashboard/QuickActions";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [games, setGames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const currentUser = await User.me();
      const userGames = await Game.filter({}, "-created_date", 10);
      
      setUser(currentUser);
      setGames(userGames);
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setIsLoading(false);
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
      <WelcomeCard user={user} />
      
      <StatsOverview user={user} games={games} />
      
      <QuickActions />
      
      <RecentGames games={games} currentUserEmail={user?.email} />
    </div>
  );
}
