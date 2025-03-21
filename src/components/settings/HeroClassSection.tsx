import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface HeroClassProps {
  heroClass: {
    className: string;
    description: string;
    questFormat: string;
    consequenceDescription: string;
  };
  theme: any;
}

const HeroClassSection = ({ heroClass, theme }: HeroClassProps) => {
  return (
    <View style={[styles.heroClassSection, { 
      backgroundColor: theme.mode === 'dark' ? theme.boxBackground : 'rgba(245, 245, 245, 0.7)',
      borderColor: theme.border 
    }]}>
      <View style={[styles.heroClassTitleContainer, { 
        backgroundColor: theme.mode === 'dark' ? 'rgba(255, 0, 0, 0.2)' : 'rgba(255, 0, 0, 0.1)' 
      }]}>
        <Text style={[styles.heroClassPrefix, { color: theme.subtext }]}>⚔️ YOUR HERO CLASS</Text>
        <Text style={[styles.heroClassName, { color: theme.accent }]}>{heroClass.className}</Text>
      </View>
      
      <View style={[styles.heroClassContentBox, { backgroundColor: theme.boxBackground }]}>
        <View style={styles.heroClassInfoSection}>
          <Text style={[styles.heroClassSubtitle, { color: theme.accent }]}>📜 Description</Text>
          <Text style={[styles.heroClassText, { color: theme.text }]}>{heroClass.description}</Text>
        </View>
        
        <View style={[styles.heroClassDivider, { backgroundColor: theme.border }]} />
        
        <View style={styles.heroClassInfoSection}>
          <Text style={[styles.heroClassSubtitle, { color: theme.accent }]}>🎯 Quest Format</Text>
          <Text style={[styles.heroClassText, { color: theme.text }]}>{heroClass.questFormat}</Text>
        </View>
        
        <View style={[styles.heroClassDivider, { backgroundColor: theme.border }]} />
        
        <View style={styles.heroClassInfoSection}>
          <Text style={[styles.heroClassSubtitle, { color: theme.accent }]}>⚖️ Consequence System</Text>
          <Text style={[styles.heroClassText, { color: theme.text }]}>{heroClass.consequenceDescription}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  heroClassSection: {
    marginHorizontal: 10,
    marginVertical: 15,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  heroClassTitleContainer: {
    padding: 15,
    alignItems: 'center',
  },
  heroClassPrefix: {
    fontSize: 12,
    fontWeight: 'bold',
    letterSpacing: 1,
    marginBottom: 5,
  },
  heroClassName: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  heroClassContentBox: {
    padding: 15,
  },
  heroClassInfoSection: {
    marginVertical: 5,
  },
  heroClassSubtitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  heroClassText: {
    fontSize: 14,
    lineHeight: 20,
    paddingLeft: 10,
  },
  heroClassDivider: {
    height: 1,
    marginVertical: 12,
  },
});

export default HeroClassSection;
