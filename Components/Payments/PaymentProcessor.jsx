import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { CreditCard, Smartphone, Loader2, CheckCircle, AlertCircle } from "lucide-react";

export default function PaymentProcessor({ amount, onSuccess, onCancel, open, onOpenChange }) {
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState('select'); // 'select', 'processing', 'success', 'error'
  const [paymentResult, setPaymentResult] = useState(null);

  // Credit card form state
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const resetPayment = () => {
    setPaymentStep('select');
    setPaymentMethod(null);
    setPaymentResult(null);
    setCardData({ number: '', expiry: '', cvv: '', name: '' });
  };

  const processDigitalWalletPayment = async (method) => {
    try {
      // סימולציה של תהליך אימות
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Random success rate
      const success = Math.random() > 0.1; // 90% success
      
      if (success) {
        return {
          success: true,
          transactionId: `${method.toLowerCase().replace(' ', '_')}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          method: method
        };
      } else {
        throw new Error(`תשלום ${method} נכשל - נסה שוב`);
      }
    } catch (error) {
      throw error;
    }
  };

  const processCreditCardPayment = async () => {
    // Validate card data
    if (!cardData.number || !cardData.expiry || !cardData.cvv || !cardData.name) {
      throw new Error('נא למלא את כל פרטי הכרטיס');
    }

    const cardNumber = cardData.number.replace(/\s/g, '');
    if (cardNumber.length < 15 || cardNumber.length > 19) {
      throw new Error('מספר כרטיס לא תקין');
    }

    if (!isValidLuhn(cardNumber)) {
      throw new Error('מספר כרטיס לא תקין');
    }

    // סימולציה של תשלום עם כרטיס אשראי
    await new Promise(resolve => setTimeout(resolve, 4000));
    
    // סימולציה של תגובה מחברת האשראי
    const success = Math.random() > 0.15; // 85% הצלחה
    
    if (success) {
      return {
        success: true,
        transactionId: `cc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        last4: cardNumber.slice(-4),
        cardType: getCardType(cardNumber)
      };
    } else {
      const errors = [
        'כרטיס נדחה - פנה לחברת האשראי',
        'אין כיסוי מספק בכרטיס',
        'כרטיס חסום או פג תוקף',
        'שגיאה טכנית - נסה שוב מאוחר יותר'
      ];
      throw new Error(errors[Math.floor(Math.random() * errors.length)]);
    }
  };

  const handlePayment = async () => {
    if (!paymentMethod) return;

    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      let result;
      
      if (paymentMethod === 'credit-card') {
        result = await processCreditCardPayment();
      } else {
        result = await processDigitalWalletPayment(paymentMethod);
      }

      setPaymentResult(result);
      setPaymentStep('success');
      
      // Call success callback after short delay
      setTimeout(() => {
        onSuccess(result);
        resetPayment();
      }, 2000);

    } catch (error) {
      setPaymentResult({ error: error.message });
      setPaymentStep('error');
    } finally {
      setIsProcessing(false);
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

  const getCardType = (cardNumber) => {
    if (cardNumber.startsWith('4')) return 'Visa';
    if (cardNumber.startsWith('5') || cardNumber.startsWith('2')) return 'Mastercard';
    if (cardNumber.startsWith('3')) return 'American Express';
    return 'כרטיס אשראי';
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
    if (v.length >= 2) return v.slice(0, 2) + '/' + v.slice(2, 4);
    return v;
  };

  if (paymentStep === 'processing') {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <div className="text-center py-8">
            <Loader2 className="w-16 h-16 mx-auto text-blue-400 animate-spin mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">מעבד תשלום...</h3>
            <p className="text-gray-400">אנא המתן, התשלום מעובד בצורה מאובטחת</p>
            <div className="mt-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <p className="text-yellow-300 text-sm">🔒 התשלום מוצפן ומאובטח</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (paymentStep === 'success') {
    return (
      <Dialog open={open} onOpenChange={() => {}}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <div className="text-center py-8">
            <CheckCircle className="w-16 h-16 mx-auto text-green-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">התשלום בוצע בהצלחה!</h3>
            <p className="text-gray-400 mb-4">₪{amount} הופקדו ליתרה שלך</p>
            {paymentResult?.transactionId && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <p className="text-green-300 text-sm">
                  מספר עסקה: {paymentResult.transactionId}
                </p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (paymentStep === 'error') {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-gray-900 border-gray-700">
          <div className="text-center py-8">
            <AlertCircle className="w-16 h-16 mx-auto text-red-400 mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">שגיאה בתשלום</h3>
            <p className="text-red-400 mb-4">{paymentResult?.error}</p>
            <div className="flex gap-2">
              <Button onClick={resetPayment} className="flex-1 bg-blue-600 hover:bg-blue-700">
                נסה שוב
              </Button>
              <Button variant="outline" onClick={onCancel} className="border-gray-600">
                ביטול
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white text-center">
            תשלום ₪{amount}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {!paymentMethod ? (
            <>
              <p className="text-gray-400 text-center mb-6">בחר אמצעי תשלום:</p>
              
              <div className="space-y-3">
                <Card 
                  className="bg-gray-800 border-gray-600 cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => setPaymentMethod('credit-card')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CreditCard className="w-6 h-6 text-blue-400" />
                      <div>
                        <p className="text-white font-medium">כרטיס אשראי</p>
                        <p className="text-gray-400 text-sm">Visa, Mastercard, American Express</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="bg-gray-800 border-gray-600 cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => setPaymentMethod('Apple Pay')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-6 h-6 text-gray-400" />
                      <div className="flex items-center gap-2">
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                        </svg>
                        <span className="text-white font-medium">Apple Pay</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card 
                  className="bg-gray-800 border-gray-600 cursor-pointer hover:bg-gray-700 transition-colors"
                  onClick={() => setPaymentMethod('Google Pay')}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-6 h-6 text-gray-400" />
                      <div className="flex items-center gap-2">
                        <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        <span className="text-white font-medium">Google Pay</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : paymentMethod === 'credit-card' ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-white">שם בעל הכרטיס</Label>
                <Input
                  value={cardData.name}
                  onChange={(e) => setCardData(prev => ({...prev, name: e.target.value}))}
                  placeholder="שם מלא"
                  className="bg-gray-800 border-gray-600 text-white"
                />
              </div>
              
              <div className="space-y-2">
                <Label className="text-white">מספר כרטיס</Label>
                <Input
                  value={cardData.number}
                  onChange={(e) => setCardData(prev => ({...prev, number: formatCardNumber(e.target.value)}))}
                  placeholder="0000 0000 0000 0000"
                  className="bg-gray-800 border-gray-600 text-white"
                  maxLength={19}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-white">תוקף</Label>
                  <Input
                    value={cardData.expiry}
                    onChange={(e) => setCardData(prev => ({...prev, expiry: formatExpiry(e.target.value)}))}
                    placeholder="MM/YY"
                    className="bg-gray-800 border-gray-600 text-white"
                    maxLength={5}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-white">CVV</Label>
                  <Input
                    value={cardData.cvv}
                    onChange={(e) => setCardData(prev => ({...prev, cvv: e.target.value.replace(/\D/g, '')}))}
                    placeholder="123"
                    className="bg-gray-800 border-gray-600 text-white"
                    maxLength={4}
                    type="password"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : "שלם עכשיו"}
                </Button>
                <Button variant="outline" onClick={() => setPaymentMethod(null)} className="border-gray-600">
                  חזור
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-gray-400">לחץ להמשך תשלום עם {paymentMethod}</p>
              <Button 
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : `המשך עם ${paymentMethod}`}
              </Button>
              <Button variant="outline" onClick={() => setPaymentMethod(null)} className="w-full border-gray-600">
                חזור
              </Button>
            </div>
          )}

          {!paymentMethod && (
            <div className="flex gap-2 pt-4">
              <Button variant="outline" onClick={onCancel} className="w-full border-gray-600">
                ביטול
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
