import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserPlus, Mail, Search } from "lucide-react";

export default function AddFriendDialog({ 
  open, 
  onOpenChange, 
  allUsers, 
  currentFriends, 
  currentUserEmail, 
  onAddFriend,
  outgoingRequests,
  incomingRequests
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  const pendingEmails = new Set([
    ...outgoingRequests.map(r => r.to_email),
    ...incomingRequests.map(r => r.from_email)
  ]);

  const availableUsers = allUsers.filter(user => 
    user.email !== currentUserEmail && 
    !currentFriends.includes(user.email) &&
    !pendingEmails.has(user.email) &&
    (user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     user.nickname?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddFriend = async () => {
    if (selectedUser) {
      await onAddFriend(selectedUser.email);
      setSelectedUser(null);
      setSearchTerm("");
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      onOpenChange(isOpen);
      if (!isOpen) {
        setSearchTerm("");
        setSelectedUser(null);
      }
    }}>
      <DialogContent className="bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-green-400" />
            הוסף חבר חדש
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">חפש משתמשים</Label>
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="הזן שם או מייל..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-gray-800 border-gray-600 text-white pr-10"
              />
            </div>
          </div>

          {searchTerm && (
            <div className="max-h-60 overflow-y-auto space-y-2">
              {availableUsers.length > 0 ? (
                availableUsers.map((user) => (
                  <div
                    key={user.email}
                    onClick={() => setSelectedUser(user)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedUser?.email === user.email
                        ? "bg-green-500/20 border border-green-500/30"
                        : "bg-gray-800/50 hover:bg-gray-800"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {(user.nickname || user.full_name)?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-white font-medium">
                          {user.nickname || user.full_name}
                        </p>
                        <p className="text-gray-400 text-sm flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-400 text-center py-4">לא נמצאו משתמשים או שכבר נשלחה בקשה</p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleAddFriend}
              disabled={!selectedUser}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              שלח בקשת חברות
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
