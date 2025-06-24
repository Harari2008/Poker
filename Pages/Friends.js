import React, { useState, useEffect } from "react";
import { User, FriendRequest } from "@/entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search } from "lucide-react";

import FriendsList from "../components/friends/FriendsList";
import AddFriendDialog from "../components/friends/AddFriendDialog";
import FriendStats from "../components/friends/FriendStats";
import FriendRequests from "../components/friends/FriendRequests";

export default function Friends() {
  const [user, setUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const currentUser = await User.me();
      const users = await User.list();
      
      const friendsData = users.filter(u => 
        (currentUser.friends || []).includes(u.email) && u.email !== currentUser.email
      );

      const incRequests = await FriendRequest.filter({ to_email: currentUser.email, status: 'pending' });
      const outRequests = await FriendRequest.filter({ from_email: currentUser.email, status: 'pending' });
      
      setUser(currentUser);
      setAllUsers(users);
      setFriends(friendsData);
      setIncomingRequests(incRequests);
      setOutgoingRequests(outRequests);
    } catch (error) {
      console.error("Error loading friends data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendFriendRequest = async (friendEmail) => {
    try {
      await FriendRequest.create({
        from_email: user.email,
        from_nickname: user.nickname || user.full_name,
        from_avatar: user.avatar_url || "",
        to_email: friendEmail
      });
      loadData();
    } catch (error) {
      alert("שגיאה בשליחת בקשת החברות");
    }
  };

  const handleAcceptRequest = async (request) => {
    try {
      const friendUser = allUsers.find(u => u.email === request.from_email);
      if (!friendUser) {
        alert("המשתמש ששלח את הבקשה לא נמצא");
        return;
      }

      // Update my friends list
      const myUpdatedFriends = [...(user.friends || []), request.from_email];
      await User.updateMyUserData({ friends: myUpdatedFriends });
      
      // Update friend's list
      const friendUpdatedFriends = [...(friendUser.friends || []), user.email];
      await User.update(friendUser.id, { friends: friendUpdatedFriends });

      // Update request status
      await FriendRequest.update(request.id, { status: 'accepted' });
      
      loadData();
    } catch (error) {
      console.error("Error accepting request:", error);
      alert("שגיאה באישור הבקשה");
    }
  };

  const handleDeclineRequest = async (request) => {
    try {
      await FriendRequest.update(request.id, { status: 'declined' });
      loadData();
    } catch (error) {
      alert("שגיאה בדחיית הבקשה");
    }
  };

  const removeFriend = async (friendEmail) => {
    if (!confirm("האם אתה בטוח שברצונך להסיר את החבר?")) return;
    try {
      const friendUser = allUsers.find(u => u.email === friendEmail);
      
      const myUpdatedFriends = (user.friends || []).filter(email => email !== friendEmail);
      await User.updateMyUserData({ friends: myUpdatedFriends });
      
      if(friendUser) {
        const friendUpdatedFriends = (friendUser.friends || []).filter(email => email !== user.email);
        await User.update(friendUser.id, { friends: friendUpdatedFriends });
      }

      // Optionally, find and remove the friend request entity
      const req1 = await FriendRequest.filter({ from_email: user.email, to_email: friendEmail });
      const req2 = await FriendRequest.filter({ from_email: friendEmail, to_email: user.email });
      if (req1.length > 0) await FriendRequest.delete(req1[0].id);
      if (req2.length > 0) await FriendRequest.delete(req2[0].id);
      
      loadData();
    } catch (error) {
      console.error("Error removing friend: ", error);
      alert("שגיאה בהסרת החבר");
    }
  };

  const filteredFriends = friends.filter(friend =>
    friend.nickname?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    friend.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-400"></div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">החברים שלי</h1>
          <p className="text-gray-400">נהל את רשימת החברים שלך למשחקי פוקר</p>
        </div>
        <Button
          onClick={() => setShowAddDialog(true)}
          className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
        >
          <UserPlus className="w-4 h-4" />
          הוסף חבר
        </Button>
      </div>

      <FriendRequests
        requests={incomingRequests}
        onAccept={handleAcceptRequest}
        onDecline={handleDeclineRequest}
      />

      <Card className="bg-black/20 border-gray-700/50">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="חפש חברים..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-gray-800 border-gray-600 text-white pr-10"
            />
          </div>
        </CardContent>
      </Card>

      <FriendStats friends={friends} />

      <FriendsList 
        friends={filteredFriends} 
        onRemoveFriend={removeFriend}
      />

      <AddFriendDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        allUsers={allUsers}
        currentFriends={user?.friends || []}
        currentUserEmail={user?.email}
        onAddFriend={sendFriendRequest}
        outgoingRequests={outgoingRequests}
        incomingRequests={incomingRequests}
      />
    </div>
  );
}
