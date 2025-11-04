
interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
}

export default function StatsCard({ title, value, subtitle }: StatsCardProps) {
  return (
    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 hover:shadow-md transition">
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {subtitle && (
        <span className="text-xs text-gray-400 dark:text-gray-500">{subtitle}</span>
      )}
    </div>
  );
}
