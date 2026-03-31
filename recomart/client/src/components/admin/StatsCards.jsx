import React from 'react';

const colorMap = {
  blue: 'bg-blue-100 text-blue-600',
  green: 'bg-green-100 text-green-600',
  purple: 'bg-purple-100 text-purple-600',
  orange: 'bg-orange-100 text-orange-600',
  red: 'bg-red-100 text-red-600',
  indigo: 'bg-indigo-100 text-indigo-600',
  pink: 'bg-pink-100 text-pink-600',
  yellow: 'bg-yellow-100 text-yellow-600',
};

const StatsCards = ({ stats }) => {
  if (!stats || Object.keys(stats).length === 0) return null;

  const entries = Array.isArray(stats) ? stats : Object.values(stats);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {entries.map((stat, index) => {
        const Icon = stat.icon;
        const colorClass = colorMap[stat.color] || colorMap.blue;

        return (
          <div
            key={index}
            className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  {typeof stat.value === 'number'
                    ? stat.value.toLocaleString()
                    : stat.value}
                </p>
              </div>
              {Icon && (
                <div className={`p-3 rounded-full ${colorClass}`}>
                  <Icon size={24} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
