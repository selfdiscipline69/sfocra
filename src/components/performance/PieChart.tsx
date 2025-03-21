import React from 'react';
import { View } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

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
  const total = data.reduce((sum, item) => sum + item.minutes, 0);
  let startAngle = 0;
  
  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <View style={{ 
        width: size, 
        height: size, 
        borderRadius: size/2, 
        overflow: 'hidden',
        position: 'relative'
      }}>
        {data.map((item, index) => {
          const sweepAngle = (item.minutes / total) * 360;
          const endAngle = startAngle + sweepAngle;
          
          // Create a wedge shape using absolute positioning and rotation
          const result = (
            <View key={index} style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              transform: [
                { rotate: `${startAngle}deg` }
              ]
            }}>
              <View style={{
                width: '50%',
                height: '100%',
                position: 'absolute',
                left: '50%',
                backgroundColor: item.color,
                transform: sweepAngle > 180 ? [
                  { rotate: '180deg' }
                ] : [
                  { rotate: `${sweepAngle}deg` }
                ],
                transformOrigin: 'left center'
              }} />
              {sweepAngle > 180 && (
                <View style={{
                  width: '50%',
                  height: '100%',
                  position: 'absolute',
                  left: 0,
                  backgroundColor: item.color,
                  transform: [
                    { rotate: `${sweepAngle - 180}deg` }
                  ],
                  transformOrigin: 'right center'
                }} />
              )}
            </View>
          );
          
          startAngle = endAngle;
          return result;
        })}
      </View>
      {/* Optional center circle for donut effect */}
      <View style={{
        position: 'absolute',
        top: size/4,
        left: size/4,
        width: size/2,
        height: size/2,
        borderRadius: size/4,
        backgroundColor: theme.boxBackground,
      }} />
    </View>
  );
};

export default PieChart;
