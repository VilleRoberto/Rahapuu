import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING } from '../utils/constants';
import { User } from '../types/user';

interface WelcomeScreenProps {
  onUserCreated: (user: User) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onUserCreated }) => {
  const { t } = useTranslation();

  const handleGetStarted = () => {
    // For demo purposes, create a demo user
    const demoUser: User = {
      id: 'user_demo_123',
      name: 'Demo Lapsi',
      userType: 'child',
      language: 'fi',
      treeType: 'default',
      backgroundTheme: 'forest',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onUserCreated(demoUser);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.treeIcon}>🌳</Text>
      <Text style={styles.title}>{t('welcome.title')}</Text>
      <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>
      
      <TouchableOpacity style={styles.button} onPress={handleGetStarted}>
        <Text style={styles.buttonText}>{t('welcome.getStarted')}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
  },
  treeIcon: {
    fontSize: 80,
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.surface,
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.surface,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    opacity: 0.9,
  },
  button: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 25,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  buttonText: {
    color: COLORS.primary,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;