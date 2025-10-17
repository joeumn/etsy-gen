"use client";

import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from 'lucide-react';
import type { SaveStatus } from '../page';
import { createClient } from '@/lib/db/client';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfileSettingsProps {
  setSaveStatus: (status: SaveStatus) => void;
}

const ProfileSettingsSkeleton = () => (
    <Card>
        <CardHeader>
            <Skeleton className="h-6 w-1/4" />
            <Skeleton className="h-4 w-1/2" />
        </CardHeader>
        <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <div className="space-y-2">
                    <Skeleton className="h-9 w-28" />
                    <Skeleton className="h-3 w-40" />
                </div>
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/5" />
                <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
                <Skeleton className="h-4 w-1/5" />
                <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-3 w-1/3" />
            </div>
        </CardContent>
    </Card>
);


const ProfileSettings = forwardRef((props: ProfileSettingsProps, ref) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
        const { data: profileData } = await supabase
          .from('users')
          .select('name, avatar_url')
          .eq('id', user.id)
          .single();

        if (profileData) {
          setName(profileData.name || '');
          setAvatarUrl(profileData.avatar_url || '');
        }
      }
      setIsLoading(false);
    };
    fetchUserData();
  }, [supabase]);

  useImperativeHandle(ref, () => ({
    handleSave: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const response = await fetch('/api/settings/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, avatar_url: avatarUrl }),
      });

      return response.ok;
    },
  }));

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAvatarUrl(URL.createObjectURL(file));
    }
  };

  if (isLoading) {
    return <ProfileSettingsSkeleton />;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile</CardTitle>
        <CardDescription>
          Manage your public profile information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center space-x-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={avatarUrl} alt="User avatar" />
            <AvatarFallback>
              <User className="h-10 w-10 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-2">
            <Button asChild variant="outline">
              <label htmlFor="avatar-upload" className="cursor-pointer">
                Change Avatar
                <input
                  id="avatar-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleAvatarChange}
                />
              </label>
            </Button>
            <p className="text-xs text-muted-foreground">
              PNG, JPG, or GIF. 10MB max.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your full name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            value={email}
            disabled
            className="cursor-not-allowed bg-muted/50"
          />
           <p className="text-xs text-muted-foreground">
              Email address cannot be changed.
            </p>
        </div>
      </CardContent>
    </Card>
  );
});

ProfileSettings.displayName = 'ProfileSettings';
export default ProfileSettings;