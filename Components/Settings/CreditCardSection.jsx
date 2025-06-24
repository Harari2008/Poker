import React, { useState } from "react";
import { User } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CreditCard, Trash2, Plus, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function CreditCardSection({ user, onUpdate }) {
  const [showAddCardDialog, setShowAddCardDialog] = useState(false);
  const [cardData, setCardData] = useState({
    name: "",
    number: "",
    expiry: "",
    cvv: ""
  });
  const [isSaving, setIsSaving] = useState(false);

  const addCreditCard = async () => {
    if (!cardData.name || !cardData.number || !cardData.expiry || !cardData.cvv) {
      alert("נא למלא את כל הפרטים");
      return;
    }

    if (!isValidLuhn(cardData.number.replace(/\s/g, ''))) {
      alert("מספר כרטיס לא תקין");
      return;
    }
    
    if (!/^\d{2}\/\d{2}$/.test(cardData.expiry)) {
      alert("תוקף לא תקין (MM/YY)");
      return;
    }

    const [month, year] = cardData.expiry.split('/');
    const expiryDate = new Date(2000 + parseInt(year), parseInt(month) - 1);
    const now = new Date();
    now.setHours(0,0,0,0)
    if (expiryDate < now) {
      alert("כרטיס פג תוקף");
      return;
    }

    if (cardData.cvv.length < 3) {
      alert("CVV לא תקין");
      return;
    }

    setIsSaving(true);
    try {
      // No real validation, just create a token
      const newCard = {
        name: cardData.name,
        token: `card_tok_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        last4: cardData.number.replace(/\s/g, '').slice(-4)
      };

      const currentCards = user.credit_cards || [];
      await User.updateMyUserData({
        credit_cards: [...currentCards, newCard]
      });

      setShowAddCardDialog(false);
      setCardData({ name: "", number: "", expiry: "", cvv: "" });
      onUpdate();
      alert("כרטיס האשראי נוסף בהצלחה");
    } catch (error) {
      console.error("Card saving error:", error);
      alert(`שגיאה בהוספת כרטיס: ${error.message || "נסה שוב מאוחר יותר"}`);
    } finally {
      setIsSaving(false);
    }
  };

  const deleteCreditCard = async (cardToken) => {
    if (!confirm("האם אתה בטוח שברצונך למחוק את הכרטיס?")) return;

    try {
      const updatedCards = (user.credit_cards || []).filter(card => card.token !== cardToken);
      await User.updateMyUserData({ credit_cards: updatedCards });
      onUpdate();
      alert("הכרטיס נמחק בהצלחה");
    } catch (error) {
      console.error("Error deleting card:", error);
      alert("שגיאה במחיקת הכרטיס");
    }
  };
  
  const isValidLuhn = (cardNumber) => {
    let sum = 0;
    let isEven = false;
    for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber[i]);
        if (isEven) {
            digit *= 2;
            if (digit > 9) digit -= 9;
        }
        sum += digit;
        isEven = !isEven;
    }
    return sum % 10 === 0;
  };
  
  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{1,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    return parts.length ? parts.join(' ') : v;
  };

  const formatExpiry = (value) => {
    const v = value.replace(/\D/g, '');
    if (v.length > 2) return v.slice(0, 2) + '/' + v.slice(2, 4);
    return v;
  };

  return (
    <>
      <div data-section="credit-cards">
        <Card className="bg-black/20 border-gray-700/50">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-400" />
                כרטיסי אשראי
              </CardTitle>
              {(user?.credit_cards?.length || 0) < 2 && (
                <Button onClick={() => setShowAddCardDialog(true)} size="sm" className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-4 h-4 mr-2" />
                  הוסף כרטיס
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {(user?.credit_cards && user.credit_cards.length > 0) ? (
              user.credit_cards.map(card => (
                <div key={card.token} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{card.name}</p>
                      <p className="text-gray-400 text-sm">**** **** **** {card.last4}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteCreditCard(card.token)}>
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-400 py-4">
                <p>לא נוספו כרטיסי אשראי.</p>
                <p className="text-sm">יש להוסיף כרטיס כדי להפקיד כסף ולהצטרף למשחקים.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={showAddCardDialog} onOpenChange={setShowAddCardDialog}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              <Plus className="w-5 h-5" /> הוספת כרטיס אשראי
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-white">כינוי לכרטיס</Label>
              <Input
                placeholder="לדוגמה: פרטי, עסקי..."
                value={cardData.name}
                onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value }))}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">מספר כרטיס</Label>
              <Input
                placeholder="0000 0000 0000 0000"
                value={cardData.number}
                onChange={(e) => setCardData(prev => ({ ...prev, number: formatCardNumber(e.target.value) }))}
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white">תוקף (MM/YY)</Label>
                <Input
                  placeholder="12/28"
                  value={cardData.expiry}
                  onChange={(e) => setCardData(prev => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-white">CVV</Label>
                <Input
                  type="password"
                  placeholder="123"
                  maxLength="4"
                  value={cardData.cvv}
                  onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value.replace(/\D/g, '') }))}
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
            </div>
            <Button onClick={addCreditCard} disabled={isSaving} className="w-full bg-blue-600 hover:bg-blue-700">
              {isSaving ? "שומר..." : "שמור כרטיס"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
