import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import AnimatedTree from '../components/tree/AnimatedTree';
import GoalCard from '../components/shared/GoalCard';

// Services
import DatabaseService from '../services/database';

// Types
import { TreeProgress } from '../types/tree';
import { SavingsGoal } from '../types/goal';
import { User } from '../types/user';

// Utils
import { COLORS, SPACING } from '../utils/constants';

const TreeScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  
  const [treeProgress, setTreeProgress] = useState<TreeProgress | null>(null);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      // For demo purposes, we'll use a hardcoded user ID
      // In a real app, this would come from authentication
      const userId = 'user_demo_123';
      
      // Load user data
      const userData = await DatabaseService.getUserById(userId);
      if (userData) {
        setUser(userData);
      }
      
      // Load tree progress
      const treeData = await DatabaseService.getTreeProgress(userId);
      if (treeData) {
        setTreeProgress(treeData);
      } else {
        // Create initial tree progress if it doesn't exist
        await DatabaseService.createInitialTreeProgress(userId);
        const newTreeData = await DatabaseService.getTreeProgress(userId);
        if (newTreeData) {
          setTreeProgress(newTreeData);
        }
      }
      
      // Load goals
      const goalsData = await DatabaseService.getGoalsByUserId(userId);
      setGoals(goalsData.slice(0, 3)); // Show only first 3 goals
      
    } catch (error) {
      console.error('Error loading tree data:', error);
      Alert.alert(
        'Virhe',
        'Tietojen lataaminen epäonnistui. Yritä uudelleen.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setIsRefreshing(true);
    loadData();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const handleAddMoney = () => {
    navigation.navigate('AddMoney' as never);
  };

  const handleGoToGoals = () => {
    navigation.navigate('Goals' as never);
  };

  const handleGoToTasks = () => {
    navigation.navigate('Tasks' as never);
  };

  const handleParentAccess = () => {
    navigation.navigate('Parent' as never);
  };

  const handleTreePress = () => {
    // Show tree interaction animation or sound
    Alert.alert(
      '🌳',
      'Hienoa! Puusi kasvaa joka kerta kun säästät rahaa!',
      [{ text: 'OK' }]
    );
  };

  if (isLoading || !treeProgress) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>🌳</Text>
        <Text style={styles.loadingTitle}>{t('common.loading')}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            {t('welcome.title')}
          </Text>
          <TouchableOpacity
            style={styles.parentButton}
            onPress={handleParentAccess}
          >
            <Text style={styles.parentButtonText}>👨‍👩‍👧‍👦</Text>
          </TouchableOpacity>
        </View>

        {/* Tree Display */}
        <AnimatedTree
          treeProgress={treeProgress}
          onTreePress={handleTreePress}
          isGrowing={false}
        />

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleAddMoney}
          >
            <Text style={styles.actionButtonIcon}>💰</Text>
            <Text style={styles.actionButtonText}>
              {t('tree.addMoney')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleGoToGoals}
          >
            <Text style={styles.actionButtonIcon}>🎯</Text>
            <Text style={styles.actionButtonText}>
              {t('tree.goals')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton]}
            onPress={handleGoToTasks}
          >
            <Text style={styles.actionButtonIcon}>📋</Text>
            <Text style={styles.actionButtonText}>
              {t('tree.tasks')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Recent Goals */}
        {goals.length > 0 && (
          <View style={styles.goalsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {t('goals.title')}
              </Text>
              <TouchableOpacity onPress={handleGoToGoals}>
                <Text style={styles.seeAllText}>
                  Näytä kaikki →
                </Text>
              </TouchableOpacity>
            </View>
            
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onPress={() => {}}
                showProgress={true}
              />
            ))}
          </View>
        )}

        {/* Empty State for Goals */}
        {goals.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🎯</Text>
            <Text style={styles.emptyStateTitle}>
              Ei vielä tavoitteita
            </Text>
            <Text style={styles.emptyStateSubtitle}>
              Luo ensimmäinen säästötavoitteesi!
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={handleGoToGoals}
            >
              <Text style={styles.emptyStateButtonText}>
                {t('goals.addNew')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    fontSize: 60,
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 18,
    color: COLORS.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  parentButton: {
    padding: SPACING.sm,
    borderRadius: 20,
    backgroundColor: COLORS.surface,
  },
  parentButtonText: {
    fontSize: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: SPACING.md,
    borderRadius: 12,
    marginHorizontal: SPACING.xs,
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
  },
  secondaryButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  actionButtonIcon: {
    fontSize: 24,
    marginBottom: SPACING.xs,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  goalsSection: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  seeAllText: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xl,
  },
  emptyStateIcon: {
    fontSize: 60,
    marginBottom: SPACING.md,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  emptyStateButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default TreeScreen;