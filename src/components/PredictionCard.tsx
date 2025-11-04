interface Prediction {
  homeTeam: string;
  awayTeam: string;
  homeScore?: number;
  awayScore?: number;
  predictedHomeGoals: number;
  predictedAwayGoals: number;
  status?: "win" | "lose" | "pending";
}

export default function PredictionCard({ homeTeam, awayTeam, predictedHomeGoals, predictedAwayGoals, status }: Prediction) {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 shadow-sm hover:shadow-md transition mb-4">
      
      <div className="flex items-center justify-between">
        <span className="font-semibold text-gray-800 dark:text-gray-100">
          {homeTeam} vs {awayTeam}
        </span>

        {status && (
          <span
            className={`px-2 py-1 text-xs rounded-lg ${
              status === "win"
                ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                : status === "lose"
                ? "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
                : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
            }`}
          >
            {status.toUpperCase()}
          </span>
        )}
      </div>

      <div className="mt-3 text-sm text-gray-600 dark:text-gray-300">
        <p>📊 Predicted Score:</p>
        <p className="font-medium text-lg">
          {predictedHomeGoals} - {predictedAwayGoals}
        </p>
      </div>
    </div>
  );
}
