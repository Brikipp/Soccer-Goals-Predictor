import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import { Settings as SettingsIcon } from "lucide-react";

export default function Settings() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Settings</h1>
        <p className="text-muted-foreground">
          Customize your prediction preferences
        </p>
      </div>

      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-muted to-muted/50">
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="h-5 w-5 text-primary" />
            Preferences
          </CardTitle>
          <CardDescription>Manage your application settings</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications" className="text-base">
                Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive alerts for new predictions
              </p>
            </div>
            <Switch id="notifications" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-update" className="text-base">
                Auto-update
              </Label>
              <p className="text-sm text-muted-foreground">
                Automatically fetch new match predictions
              </p>
            </div>
            <Switch id="auto-update" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="advanced" className="text-base">
                Advanced Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Show detailed prediction analytics
              </p>
            </div>
            <Switch id="advanced" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
