import React from 'react';
import { View, StyleSheet } from 'react-native';

interface PixelArtIconProps {
  category?: 'fitness' | 'learning' | 'mindfulness' | 'social' | 'creativity';
  size?: number;
  color?: string;
}

const PixelArtIcon: React.FC<PixelArtIconProps> = ({ 
  category, 
  size = 24,
  color = '#FFFFFF'
}) => {
  // Define pixel art patterns for each category
  const getPixelArt = () => {
    switch (category) {
      case 'fitness':
        return [
          [0, 1, 0],
          [1, 1, 1],
          [0, 1, 0],
          [1, 0, 1],
          [1, 0, 1]
        ];
      case 'learning':
        return [
          [0, 1, 0],
          [1, 1, 1],
          [1, 0, 1],
          [1, 1, 1],
          [0, 1, 0]
        ];
      case 'mindfulness':
        return [
          [0, 1, 0],
          [1, 1, 1],
          [1, 1, 1],
          [0, 1, 0],
          [0, 1, 0]
        ];
      case 'social':
        return [
          [1, 0, 1],
          [1, 1, 1],
          [1, 0, 1],
          [1, 0, 1],
          [1, 0, 1]
        ];
      case 'creativity':
        return [
          [0, 1, 0],
          [1, 1, 1],
          [1, 0, 1],
          [0, 1, 0],
          [1, 0, 1]
        ];
      default:
        return [
          [1, 1, 1],
          [1, 0, 1],
          [1, 1, 1],
          [1, 0, 1],
          [1, 1, 1]
        ];
    }
  };

  const pixelSize = size / 5;
  const pixelArt = getPixelArt();

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      {pixelArt.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((pixel, pixelIndex) => (
            <View
              key={pixelIndex}
              style={[
                styles.pixel,
                {
                  width: pixelSize,
                  height: pixelSize,
                  backgroundColor: pixel ? color : 'transparent',
                  margin: pixelSize * 0.1
                }
              ]}
            />
          ))}
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pixel: {
    borderRadius: 2,
  },
});

export default PixelArtIcon; 