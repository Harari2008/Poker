import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertTriangle, DollarSign } from "lucide-react";

export default function DiscountRequestDialog({ open, onOpenChange, game, user, onUpdate }) {
  const [requestAmount, setRequestAmount] = useState("");
  const [reason, setReason] = useState("");
  const [isSending, setIsSending] = useState(false);

  const sendDiscountRequest = async () => {
    if (!requestAmount || parseFloat(requestAmount) >= game.buy_in_amount) {
      alert("נא להזין סכום נמוך מסכום הקנייה המקורי");
      return;
    }

    if (!reason.trim()) {
      alert("נא להסביר מדוע אתה מבקש הנחה");
      return;
    }

    setIsSending(true);
    try {
      // In a real app, this would send a notification to the host
      // For now, we'll just show a message
      alert("הבקשה נשלחה למנהל המשחק");
      onOpenChange(false);
      setRequestAmount("");
      setReason("");
    } catch (error) {
      alert("שגיאה בשליחת הבקשה");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            בקשת הנחה
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-yellow-300 text-sm">
              <strong>סכום קנייה מקורי:</strong> ₪{game.buy_in_amount.toLocaleString()}
            </p>
            <p className="text-yellow-200 text-xs mt-1">
              אתה יכול לבקש להכנס על סכום נמוך יותר בכפוף לאישור מנהל המשחק
            </p>
          </div>

          <div className="space-y-2">
            <Label className="text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-amber-400" />
              הסכום שאתה רוצה לשלם (₪)
            </Label>
            <Input
              type="number"
              max={game.buy_in_amount - 1}
              value={requestAmount}
              onChange={(e) => setRequestAmount(e.target.value)}
              placeholder="הזן סכום נמוך יותר"
              className="bg-gray-800 border-gray-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">סיבה לבקשת ההנחה</Label>
            <Textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="הסבר מדוע אתה מבקש הנחה..."
              className="bg-gray-800 border-gray-600 text-white h-20"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={sendDiscountRequest}
              disabled={isSending || !requestAmount || !reason.trim()}
              className="flex-1 bg-yellow-600 hover:bg-yellow-700"
            >
              {isSending ? "שולח..." : "שלח בקשה"}
            </Button>
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-gray-600"
            >
              ביטול
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
