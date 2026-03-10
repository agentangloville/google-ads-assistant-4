import React from 'react';

/**
 * Badge - etykieta z kolorem
 */
export function Badge({ children, color = 'gray', size = 'sm' }) {
  const colorClasses = {
    gray: 'bg-gray-100 text-gray-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    blue: 'bg-blue-100 text-blue-700',
    amber: 'bg-amber-100 text-amber-700',
    red: 'bg-red-100 text-red-700',
    purple: 'bg-purple-100 text-purple-700',
    orange: 'bg-orange-100 text-orange-700',
    indigo: 'bg-indigo-100 text-indigo-700',
    green: 'bg-green-100 text-green-700',
  };

  const sizeClasses = {
    xs: 'px-1.5 py-0.5 text-xs',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  };

  return (
    <span className={`
      inline-flex items-center rounded-full font-medium
      ${colorClasses[color] || colorClasses.gray}
      ${sizeClasses[size] || sizeClasses.sm}
    `}>
      {children}
    </span>
  );
}

/**
 * StatusBadge - badge statusu kampanii
 */
export function StatusBadge({ status }) {
  const isActive = status === 'enabled' || status === 'active';
  const isPaused = status === 'paused';

  return (
    <Badge color={isActive ? 'emerald' : isPaused ? 'amber' : 'gray'}>
      {isActive ? '● Aktywna' : isPaused ? '○ Wstrzymana' : status}
    </Badge>
  );
}

/**
 * ProgramBadge - badge typu programu
 */
export function ProgramBadge({ type, label }) {
  const colorMap = {
    junior: 'blue',
    adult: 'emerald',
    tefl: 'purple',
    italy: 'green',
    malta: 'orange',
    eurotrip: 'indigo',
    other: 'gray',
  };

  return (
    <Badge color={colorMap[type] || 'gray'}>
      {label || type}
    </Badge>
  );
}
