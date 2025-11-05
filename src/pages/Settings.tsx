import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label.tsx";
import { User, Key, Mail, Shield, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabaseClient';

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Password change states
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters long' });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) {
        setMessage({ type: 'error', text: error.message });
      } else {
        setMessage({ type: 'success', text: 'Password updated successfully!' });
        // Clear form
        setNewPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <div className="p-3 bg-primary/10 rounded-lg">
          <User className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-1">
            User Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your account settings and password
          </p>
        </div>
      </div>

      {/* User Info Card */}
      <Card className="border-primary/20 shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            Account Information
          </CardTitle>
          <CardDescription>
            Your current account details
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
              <Mail className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium text-foreground">Email</Label>
                <p className="text-sm text-foreground">{user?.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium text-foreground">Account Status</Label>
                <p className="text-sm text-green-600 dark:text-green-500 font-medium">Active</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-muted rounded-md">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <Label className="text-sm font-medium text-foreground">User ID</Label>
                <p className="text-sm text-muted-foreground font-mono">{user?.id?.slice(0, 8)}...</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Password Change Card */}
      <Card className="border-primary/20 shadow-md">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5 text-primary" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your account password
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                required
                minLength={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={6}
              />
            </div>

            {message && (
              <div className={`flex items-center gap-2 p-3 rounded-md ${
                message.type === 'success' 
                  ? 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-500' 
                  : 'bg-destructive/10 text-destructive'
              }`}>
                {message.type === 'success' ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="text-sm">{message.text}</span>
              </div>
            )}

            <Button 
              type="submit" 
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
