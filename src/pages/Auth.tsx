import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label.tsx";
import { LogIn } from "lucide-react";

export default function Auth() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
      <Card className="w-full max-w-md shadow-lg animate-scale-in">
        <CardHeader className="space-y-1 bg-gradient-to-r from-primary/10 to-accent/10">
          <CardTitle className="text-2xl flex items-center gap-2">
            <LogIn className="h-6 w-6 text-primary" />
            Welcome Back
          </CardTitle>
          <CardDescription>
            Sign in to access your prediction history
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                className="transition-all focus:shadow-glow"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="transition-all focus:shadow-glow"
              />
            </div>
            <Button className="w-full shadow-md hover:shadow-glow transition-all">
              Sign In
            </Button>
          </form>
          <div className="mt-4 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Button variant="link" className="p-0 h-auto text-primary">
              Sign up
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
