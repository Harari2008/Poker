import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/entities/all";
import { Home, Gamepad2, BarChart3, Users, Settings as SettingsIcon, LogOut, User as UserIcon } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
        console.error("Failed to fetch user, maybe not logged in.", error);
      }
    };
    fetchUser();
  }, [location.pathname]); // Re-fetch on page change

  const handleLogout = async () => {
    try {
      await User.logout();
      setUser(null);
      window.location.href = "/"; // Redirect to homepage and force reload
    } catch(e) {
      console.error("logout failed", e)
      window.location.href = "/";
    }
  };

  const navItems = [
    { name: "בית", url: createPageUrl("Dashboard"), icon: Home },
    { name: "משחקים", url: createPageUrl("Games"), icon: Gamepad2 },
    { name: "סטטיסטיקות", url: createPageUrl("Statistics"), icon: BarChart3 },
    { name: "חברים", url: createPageUrl("Friends"), icon: Users },
    { name: "הגדרות", url: createPageUrl("Settings"), icon: SettingsIcon }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-green-900 to-slate-800" dir="rtl">
      <style>{`
        :root {
          --poker-green: #0f5132;
          --poker-gold: #ffd700;
          --poker-dark: #1a1a1a;
          --poker-light: #f8f9fa;
        }
      `}</style>
      
      <div className="flex flex-col h-[100dvh]">
        {/* Header */}
        <header className="bg-black/20 backdrop-blur-sm border-b border-amber-500/20 px-4 py-3 shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-amber-400">🃏 בוקר פוקר</h1>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="h-9 w-9 cursor-pointer border-2 border-amber-500/50">
                    <AvatarImage src={user.avatar_url} alt={user.nickname || user.full_name} />
                    <AvatarFallback className="bg-slate-700 text-amber-400">
                      {(user.nickname || user.full_name)?.charAt(0)?.toUpperCase() || <UserIcon className="w-5 h-5" />}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.nickname || user.full_name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <Link to={createPageUrl("Settings")}>
                    <DropdownMenuItem className="cursor-pointer">
                      <SettingsIcon className="ml-2 h-4 w-4" />
                      <span>הגדרות</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-500 focus:text-red-400">
                    <LogOut className="ml-2 h-4 w-4" />
                    <span>התנתקות</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="w-9 h-9 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"></div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Bottom Navigation */}
        <nav className="bg-black/30 backdrop-blur-sm border-t border-amber-500/20 shrink-0">
          <div className="flex justify-around py-2" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
            {navItems.map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <Link
                  key={item.name}
                  to={item.url}
                  className={`flex flex-col items-center p-2 rounded-lg transition-all duration-200 ${
                    isActive 
                      ? "text-amber-400 bg-amber-400/10" 
                      : "text-gray-400 hover:text-amber-300"
                  }`}
                >
                  <item.icon className="w-5 h-5 mb-1" />
                  <span className="text-xs font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
