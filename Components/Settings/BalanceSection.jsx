
import React, { useState } from "react";
import { User, Transaction } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Wallet, Plus, Minus, ArrowUpCircle, ArrowDownCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import PaymentProcessor from "../payments/PaymentProcessor";

export default function BalanceSection({ user, onUpdate }) {
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [amount, setAmount] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentProcessor, setShowPaymentProcessor] = useState(false);
  const [depositAmount, setDepositAmount] = useState(null);

  const handleDeposit = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("נא להזין סכום תקין");
      return;
    }

    const parsedAmount = parseFloat(amount);
    setDepositAmount(parsedAmount);
    setShowDepositDialog(false);
    setShowPaymentProcessor(true);
  };

  const handlePaymentSuccess = async (paymentResult) => {
    try {
      await Transaction.create({
        user_email: user.email,
        type: "deposit",
        amount: depositAmount,
        description: `הפקדה ₪${depositAmount} - ${paymentResult.transactionId || 'לא זמין'}`
      });

      await User.updateMyUserData({
        balance: (user.balance || 0) + depositAmount
      });

      setShowPaymentProcessor(false);
      setDepositAmount(null);
      setAmount("");
      onUpdate();
    } catch (error) {
      console.error("Error updating balance:", error);
      alert("שגיאה בעדכון יתרה");
    }
  };

  const handleWithdraw = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("נא להזין סכום תקין");
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount > (user?.balance || 0)) {
      alert("אין מספיק כסף ביתרה");
      return;
    }

    // Removed minimum withdrawal amount check for credit card (previously ₪50)

    setIsProcessing(true);
    try {
      // סימולציה של משיכה לכרטיס אשראי
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Random success (increased from 90% to 95% success rate)
      const success = Math.random() > 0.05; 
      
      if (!success) {
        throw new Error("שגיאה בעיבוד המשיכה - נסה שוב מאוחר יותר");
      }

      await Transaction.create({
        user_email: user.email,
        type: "withdrawal",
        amount: -withdrawAmount,
        description: `משיכה לכרטיס אשראי ₪${withdrawAmount}`
      });

      await User.updateMyUserData({
        balance: (user.balance || 0) - withdrawAmount
      });

      setShowWithdrawDialog(false);
      setAmount("");
      onUpdate();
      alert(`נמשכו בהצלחה ₪${withdrawAmount.toLocaleString()} מהיתרה שלך לכרטיס האשראי שלך`);
    } catch (error) {
      console.error("Withdrawal error:", error);
      alert(`שגיאה במשיכה: ${error.message || "נסה שוב מאוחר יותר"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDigitalWalletWithdraw = async (method) => {
    if (!amount || parseFloat(amount) <= 0) {
      alert("נא להזין סכום תקין");
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (withdrawAmount > (user?.balance || 0)) {
      alert("אין מספיק כסף ביתרה");
      return;
    }

    // Removed minimum withdrawal amount check for digital wallet (previously ₪20)

    setIsProcessing(true);
    try {
      // סימולציה של משיכה לארנק דיגיטלי
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Random success (increased from 95% to 98% success rate)
      const success = Math.random() > 0.02;
      
      if (!success) {
        const errors = ["שירות המשיכה אינו זמין כעת", "חשבון היעד אינו מאומת", "מגבלת משיכה יומית הושגה"];
        throw new Error(errors[Math.floor(Math.random() * errors.length)]);
      }

      await Transaction.create({
        user_email: user.email,
        type: "withdrawal",
        amount: -withdrawAmount,
        description: `משיכה אל ${method} ₪${withdrawAmount}`
      });

      await User.updateMyUserData({
        balance: (user.balance || 0) - withdrawAmount
      });

      setShowWithdrawDialog(false);
      setAmount("");
      onUpdate();
      alert(`נמשכו בהצלחה ₪${withdrawAmount.toLocaleString()} אל חשבונך ב-${method}`);
    } catch (error) {
      console.error(`${method} Withdrawal error:`, error);
      alert(`שגיאה במשיכה עם ${method}: ${error.message || "נסה שוב מאוחר יותר"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div data-section="balance">
        <Card className="bg-black/20 border-gray-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Wallet className="w-5 h-5 text-amber-400" />
              יתרת הכסף שלי
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center bg-gray-800/50 p-4 rounded-lg border border-gray-600">
              <div className="text-4xl font-bold text-white mb-2">
                ₪{(user?.balance || 0).toLocaleString()}
              </div>
              <p className="text-gray-200 text-sm">יתרה זמינה למשחקים</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setShowDepositDialog(true)}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                הפקד כסף
              </Button>
              <Button
                onClick={() => setShowWithdrawDialog(true)}
                disabled={!user?.balance || user.balance <= 0}
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800 flex items-center gap-2"
              >
                <Minus className="w-4 h-4" />
                משוך כסף
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <ArrowUpCircle className="w-5 h-5 text-green-400" />
              הפקדת כסף
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-white">סכום להפקדה (₪)</Label>
              <Input
                type="number"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="הזן סכום"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            {/* Updated message and styling for payment system information */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
              <p className="text-blue-300 text-xs text-center">
                ℹ️ במערכת אמיתית התשלום יתבצע דרך Stripe/Adyen
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleDeposit}
                disabled={!amount}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                המשך לתשלום
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDepositDialog(false)}
                className="border-gray-600"
              >
                ביטול
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <ArrowDownCircle className="w-5 h-5 text-red-400" />
              משיכת כסף
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-white">סכום למשיכה (₪)</Label>
              <Input
                type="number"
                min="1"
                max={user?.balance || 0}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="הזן סכום"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <p className="text-sm text-gray-400">
              יתרה זמינה: ₪{(user?.balance || 0).toLocaleString()}
            </p>
            <p className="text-sm text-gray-400">
              הכסף יועבר תוך 3-5 ימי עסקים
            </p>
            
            <div className="space-y-3">
              <Button
                onClick={handleWithdraw}
                disabled={isProcessing || !amount}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin"/> : "משוך לכרטיס אשראי"}
              </Button>
              
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-gray-700" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-gray-900 px-2 text-gray-400">או</span>
                </div>
              </div>

              <Button
                onClick={() => handleDigitalWalletWithdraw('Apple Pay')}
                disabled={isProcessing || !amount}
                className="w-full bg-black hover:bg-gray-800 text-white border border-gray-600 flex items-center justify-center gap-3 py-3"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                משיכה ל-Apple Pay
              </Button>
              
              <Button
                onClick={() => handleDigitalWalletWithdraw('Google Pay')}
                disabled={isProcessing || !amount}
                className="w-full bg-white hover:bg-gray-100 text-black flex items-center justify-center gap-3 py-3"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                משיכה ל-Google Pay
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={() => setShowWithdrawDialog(false)}
              className="w-full border-gray-600"
              disabled={isProcessing}
            >
              ביטול
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Processor */}
      <PaymentProcessor
        amount={depositAmount}
        open={showPaymentProcessor}
        onOpenChange={setShowPaymentProcessor}
        onSuccess={handlePaymentSuccess}
        onCancel={() => {
          setShowPaymentProcessor(false);
          setDepositAmount(null);
          setAmount("");
        }}
      />
    </>
  );
}

