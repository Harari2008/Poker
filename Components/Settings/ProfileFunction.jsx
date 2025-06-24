import React, { useState, useRef } from "react";
import { User } from "@/entities/all";
import { UploadFile } from "@/integrations/Core";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User as UserIcon, Camera, Edit, Loader2 } from "lucide-react";

export default function ProfileSection({ user, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    nickname: user?.nickname || "",
    avatar_url: user?.avatar_url || ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { file_url } = await UploadFile({ file });
      setProfileData(prev => ({ ...prev, avatar_url: file_url }));
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("שגיאה בהעלאת התמונה.");
    } finally {
      setIsUploading(false);
    }
  };

  const saveProfile = async () => {
    setIsSaving(true);
    try {
      await User.updateMyUserData(profileData);
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      alert("שגיאה בשמירת הפרופיל");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
      setProfileData({
        nickname: user?.nickname || "",
        avatar_url: user?.avatar_url || ""
      });
      setIsEditing(false);
  };

  return (
    <Card className="bg-black/20 border-gray-700/50">
      <CardHeader>
        <div className="flex justify-between items-center">
            <CardTitle className="text-white flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-amber-400" />
              פרופיל אישי
            </CardTitle>
            {!isEditing && (
                <Button variant="outline" size="icon" onClick={() => setIsEditing(true)} className="border-gray-600 hover:bg-gray-800">
                    <Edit className="w-4 h-4 text-gray-300" />
                </Button>
            )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isEditing ? (
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <div className="w-full h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                  {user?.avatar_url ? (
                    <img src={user.avatar_url} alt="פרופיל" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <UserIcon className="w-10 h-10 text-white" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-white text-lg font-semibold">{user?.full_name}</h3>
                <p className="text-gray-400">{user?.nickname || "אין כינוי"}</p>
                <p className="text-gray-500 text-sm">{user?.email}</p>
              </div>
            </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative w-20 h-20">
                <div className="w-full h-full bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full flex items-center justify-center">
                  {profileData.avatar_url ? (
                    <img src={profileData.avatar_url} alt="פרופיל" className="w-full h-full rounded-full object-cover" />
                  ) : (
                    <UserIcon className="w-10 h-10 text-white" />
                  )}
                </div>
                <Button
                  size="icon"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full bg-blue-600 hover:bg-blue-700"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                </Button>
                <Input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/*"
                />
              </div>
              <div className="flex-1">
                <Label className="text-white">שם מלא</Label>
                <Input
                  value={user?.full_name || ""}
                  disabled
                  className="bg-gray-700/50 border-gray-600 text-gray-400 mt-1"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="text-white">כינוי</Label>
              <Input
                value={profileData.nickname}
                onChange={(e) => setProfileData({...profileData, nickname: e.target.value})}
                placeholder="הכנס כינוי"
                className="bg-gray-800 border-gray-600 text-white"
              />
            </div>

            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="border-gray-600"
              >
                ביטול
              </Button>
              <Button
                onClick={saveProfile}
                disabled={isSaving || isUploading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isSaving ? "שומר..." : "שמור שינויים"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
