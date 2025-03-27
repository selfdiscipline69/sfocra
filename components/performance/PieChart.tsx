import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { G, Path, Circle } from 'react-native-svg';
import { useTheme } from '../../src/context/ThemeContext';

interface PieChartProps {
  data: {
    category: string;
    minutes: number;
    color: string;
  }[];
  size?: number;
}

const PieChart = ({ data, size = 200 }: PieChartProps) => {
  const { theme } = useTheme();
  const radius = size / 2;
  const centerX = radius;
  const centerY = radius;
  const innerRadius = radius / 2; // For donut effect
  
  // Sort data by size (largest to smallest) to improve visualization
  const sortedData = [...data].sort((a, b) => b.minutes - a.minutes);
  
  // Calculate total for percentages
  const total = sortedData.reduce((sum, item) => sum + item.minutes, 0);
  
  // Create pie segments
  const createPieSegment = (item: { minutes: number, color: string }, index: number, total: number, startAngle: number) => {
    // Skip if data is empty or invalid
    if (!item || !item.minutes || item.minutes <= 0) return null;
    
    // Calculate the segment angle
    const segmentAngle = (item.minutes / total) * 2 * Math.PI;
    const endAngle = startAngle + segmentAngle;

    // Calculate path coordinates
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);
    
    // Determine if the arc should be drawn as a large arc (> 180 degrees)
    const largeArcFlag = segmentAngle > Math.PI ? 1 : 0;
    
    // SVG path
    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z'
    ].join(' ');

    return (
      <Path
        key={index}
        d={pathData}
        fill={item.color}
        stroke="#FFFFFF"
        strokeWidth={1}
      />
    );
  };
  
  // Render full circle if no data
  if (total === 0 || data.length === 0) {
    return (
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          <Circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="#FFFFFF" // Light grey color
          />
        </Svg>
      </View>
    );
  }
  
  // Render pie chart with segments
  let currentAngle = -Math.PI / 2; // Start from top (- PI/2)
  
  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <G>
          {/* Draw each segment */}
          {sortedData.map((item, index) => {
            const segment = createPieSegment(item, index, total, currentAngle);
            // Update current angle for next segment
            currentAngle += (item.minutes / total) * 2 * Math.PI;
            return segment;
          })}
          
          {/* Center circle for donut effect */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={innerRadius}
            fill={theme.boxBackground}
          />
        </G>
      </Svg>
    </View>
  );
};

export default PieChart;
