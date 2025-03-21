import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

interface SettingItemProps {
  item: {
    id: string;
    title: string;
    screen: string;
    isSpecial?: boolean;
    handler?: () => void;
  };
  theme: any;
  onPress: (item: any) => void;
}

const SettingItem = ({ item, theme, onPress }: SettingItemProps) => {
  return (
    <TouchableOpacity 
      style={[
        styles.settingItem, 
        item.isSpecial && styles.specialSettingItem,
        { 
          borderBottomColor: theme.border,
          backgroundColor: 'transparent'
        }
      ]}
      onPress={() => onPress(item)}
    >
      <Text style={[
        styles.settingText,
        { color: item.isSpecial ? theme.accent : theme.text },
        item.isSpecial && styles.specialSettingText
      ]}>
        {item.title}
      </Text>
      <Text style={[styles.arrowIcon, { color: theme.subtext }]}>➝</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    marginVertical: 2,
  },
  specialSettingItem: {
    borderBottomWidth: 0,
    marginTop: 15,
  },
  settingText: {
    fontSize: 16,
  },
  specialSettingText: {
    color: '#ff3b30',
    fontWeight: 'bold',
  },
  arrowIcon: {
    fontSize: 16,
  },
});

export default SettingItem;
