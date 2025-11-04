import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge.tsx";
import { TrendingUp } from "lucide-react";

export default function Predictions() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Match Predictions
        </h1>
        <p className="text-muted-foreground">
          AI-powered soccer goal predictions for upcoming matches
        </p>
      </div>

      <Card className="border-primary/20 shadow-md hover:shadow-lg transition-shadow">
        <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Get Predictions
              </CardTitle>
              <CardDescription>
                Analyze upcoming matches and get AI predictions
              </CardDescription>
            </div>
            <Badge variant="default" className="shadow-glow">
              AI Powered
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <Button size="lg" className="w-full sm:w-auto shadow-md hover:shadow-glow transition-all">
            Fetch Latest Predictions
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="hover:shadow-md transition-shadow animate-scale-in">
            <CardHeader>
              <CardTitle className="text-lg">Match #{i}</CardTitle>
              <CardDescription>Sample prediction data</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Prediction details will appear here when you fetch new predictions.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
