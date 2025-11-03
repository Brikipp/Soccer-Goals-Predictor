import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  color: 'blue' | 'green' | 'orange';
}

export function StatsCard({ title, value, color }: StatsCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className={`${colorClasses[color]} p-4 rounded-lg`}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm text-gray-600">{title}</div>
    </div>
  );
}
