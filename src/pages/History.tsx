import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.tsx";
import { Button } from "@/components/ui/button";
import { History as HistoryIcon, Trash2 } from "lucide-react";

export default function History() {
  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Prediction History
          </h1>
          <p className="text-muted-foreground">
            Review your past predictions and accuracy
          </p>
        </div>
        <Button variant="destructive" size="sm" className="gap-2">
          <Trash2 className="h-4 w-4" />
          Clear History
        </Button>
      </div>

      <Card className="shadow-md">
        <CardHeader className="bg-gradient-to-r from-muted to-muted/50">
          <CardTitle className="flex items-center gap-2">
            <HistoryIcon className="h-5 w-5 text-primary" />
            Historical Data
          </CardTitle>
          <CardDescription>
            Your prediction track record
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="text-center py-12 text-muted-foreground">
            <HistoryIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No prediction history yet</p>
            <p className="text-sm mt-2">Start making predictions to see your track record</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
