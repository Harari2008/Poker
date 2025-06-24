import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCheck, UserX, MailQuestion } from 'lucide-react';

export default function FriendRequests({ requests, onAccept, onDecline }) {
  if (!requests || requests.length === 0) {
    return null;
  }

  return (
    <Card className="bg-blue-500/10 border-blue-500/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <MailQuestion className="w-5 h-5 text-blue-400" />
          בקשות חברות
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {requests.map(req => (
          <div key={req.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">
                  {req.from_nickname?.charAt(0)?.toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-white font-semibold">{req.from_nickname}</p>
                <p className="text-gray-400 text-sm">{req.from_email}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => onAccept(req)} size="icon" className="bg-green-600 hover:bg-green-700">
                <UserCheck className="w-4 h-4" />
              </Button>
              <Button onClick={() => onDecline(req)} size="icon" variant="destructive">
                <UserX className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
