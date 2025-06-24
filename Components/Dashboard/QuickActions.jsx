import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Game, User, Transaction } from "@/entities/all";
import { Plus, Users, BarChart3, Hash, Search, Wallet, ArrowUpCircle } from "lucide-react";

import PaymentProcessor from "../payments/PaymentProcessor";

export default function QuickActions() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [gameCode, setGameCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Quick deposit state
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [showPaymentProcessor, setShowPaymentProcessor] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = await User.me();
        setUser(currentUser);
      } catch (e) {
        console.error("Failed to fetch user for quick actions");
      }
    };
    fetchUser();
  }, []);

  const reloadUser = async () => {
    try {
      const currentUser = await User.me();
      setUser(currentUser);
    } catch (e) {
      console.error("Failed to reload user");
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

  const handleQuickDeposit = (amount) => {
    setSelectedAmount(amount);
    setShowDepositDialog(false);
    setShowPaymentProcessor(true);
  };

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      // Create transaction record
      await Transaction.create({
        user_email: user.email,
        type: "deposit",
        amount: selectedAmount,
        description: `הפקדה מהירה ₪${selectedAmount} - ${paymentResult.transactionId || 'לא זמין'}`
      });

      // Update user balance
      await User.updateMyUserData({
        balance: (user.balance || 0) + selectedAmount
      });

      setShowPaymentProcessor(false);
      setSelectedAmount(null);
      await reloadUser();
    } catch (error) {
      console.error("Error updating balance:", error);
      alert("שגיאה בעדכון יתרה");
    }
  };

  const actions = [
    { title: "משחק חדש", description: "צור משחק והזמן חברים", icon: Plus, url: createPageUrl("NewGame"), color: "from-green-500 to-emerald-600" },
    { title: "הצטרף עם קוד", description: "הצטרף למשחק עם קוד", icon: Hash, onClick: () => setShowJoinDialog(true), color: "from-orange-500 to-red-600" },
    { title: "הפקד כסף", description: "הוסף כסף ליתרה שלך", icon: Wallet, onClick: () => setShowDepositDialog(true), color: "from-emerald-500 to-teal-600" },
    { title: "הזמן חברים", description: "הוסף חברים חדשים", icon: Users, url: createPageUrl("Friends"), color: "from-blue-500 to-cyan-600" },
    { title: "סטטיסטיקות", description: "צפה בביצועים שלך", icon: BarChart3, url: createPageUrl("Statistics"), color: "from-purple-500 to-pink-600" }
  ];

  return (
    <>
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-white">פעולות מהירות</h3>
        <div className="grid gap-3">
          {actions.map((action, index) => {
            const content = (
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 bg-gradient-to-r ${action.color} rounded-xl flex items-center justify-center`}>
                    <action.icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-white">{action.title}</h4>
                    <p className="text-sm text-gray-400">{action.description}</p>
                  </div>
                </div>
              </CardContent>
            );

            if (action.onClick) {
              return (
                <Card key={index} className="bg-black/20 border-gray-700/50 hover:bg-black/30 transition-all duration-200 cursor-pointer" onClick={action.onClick}>
                  {content}
                </Card>
              );
            }

            return (
              <Link key={index} to={action.url}>
                <Card className="bg-black/20 border-gray-700/50 hover:bg-black/30 transition-all duration-200">
                  {content}
                </Card>
              </Link>
            );
          })}
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
              <Input value={gameCode} onChange={(e) => setGameCode(e.target.value.toUpperCase())} placeholder="הכנס קוד (לדוגמה: ABC123)" className="bg-gray-800 border-gray-600 text-white uppercase text-center text-lg tracking-wider" maxLength={6}/>
              <p className="text-xs text-gray-400 text-center">הקוד מורכב מ-6 תווים (אותיות ומספרים)</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={joinGameByCode} disabled={isSearching || !gameCode.trim()} className="flex-1 bg-orange-600 hover:bg-orange-700">
                {isSearching ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>מחפש...</> : <><Search className="w-4 h-4" />חפש משחק</>}
              </Button>
              <Button variant="outline" onClick={() => { setShowJoinDialog(false); setGameCode(""); }} className="border-gray-600">ביטול</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Quick Deposit Dialog */}
      <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <ArrowUpCircle className="w-5 h-5 text-green-400" />
              הפקדה מהירה
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <p className="text-gray-300 text-center">
              בחר סכום להפקדה - התשלום יתבצע בצורה מאובטחת בתוך האפליקציה
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={() => handleQuickDeposit(10)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 py-4 text-lg"
              >
                ₪10
              </Button>
              
              <Button
                onClick={() => handleQuickDeposit(50)}
                className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center justify-center gap-2 py-4 text-lg"
              >
                ₪50
              </Button>
              
              <Button
                onClick={() => handleQuickDeposit(100)}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2 py-4 text-lg"
              >
                ₪100
              </Button>
            </div>

            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <p className="text-green-300 text-xs text-center">
                🔒 תשלום מאובטח עם הצפנת SSL
              </p>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowDepositDialog(false)}
              className="w-full border-gray-600"
            >
              ביטול
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Processor */}
      <PaymentProcessor
        amount={selectedAmount}
        open={showPaymentProcessor}
        onOpenChange={setShowPaymentProcessor}
        onSuccess={handlePaymentSuccess}
        onCancel={() => {
          setShowPaymentProcessor(false);
          setSelectedAmount(null);
        }}
      />
    </>
  );
}
