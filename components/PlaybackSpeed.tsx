import React from 'react';
import { Gauge } from 'lucide-react';

interface PlaybackSpeedProps {
  speed: number;
  onSpeedChange: (speed: number) => void;
}

export const PlaybackSpeed: React.FC<PlaybackSpeedProps> = ({ speed, onSpeedChange }) => {
  const speedOptions = [
    { label: '0.5x', value: 0.5 },
    { label: '0.75x', value: 0.75 },
    { label: '1x', value: 1.0 },
    { label: '1.25x', value: 1.25 },
    { label: '1.5x', value: 1.5 },
    { label: '2x', value: 2.0 },
  ];

  return (
    <div className="flex items-center space-x-2">
      <Gauge size={16} className="text-gray-500" />
      <select 
        value={speed}
        onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
        className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded-md border-none outline-none focus:ring-2 focus:ring-primary/20"
      >
        {speedOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};