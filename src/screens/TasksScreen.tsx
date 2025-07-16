import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import DatabaseService from '../services/database';
import { COLORS, SPACING } from '../utils/constants';
import { Task } from '../types/tree';
import { formatCurrency } from '../utils/currency';

const TasksScreen: React.FC = () => {
  const { t } = useTranslation();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      const userId = 'user_demo_123';
      const tasksData = await DatabaseService.getTasksByUserId(userId);
      setTasks(tasksData);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      await DatabaseService.completeTask(taskId);
      loadTasks();
      Alert.alert(
        'Hienoa!',
        'Tehtävä merkitty valmiiksi. Odottaa vanhemman hyväksyntää.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('Error completing task:', error);
      Alert.alert('Virhe', 'Tehtävän merkitseminen epäonnistui');
    }
  };

  const renderTaskCard = (task: Task) => {
    return (
      <View key={task.id} style={styles.taskCard}>
        <View style={styles.taskHeader}>
          <Text style={styles.taskTitle}>{task.title}</Text>
          <Text style={styles.taskReward}>
            {formatCurrency(task.rewardAmount)}
          </Text>
        </View>
        
        {task.description && (
          <Text style={styles.taskDescription}>{task.description}</Text>
        )}
        
        <View style={styles.taskFooter}>
          <View style={styles.taskStatus}>
            {task.isApproved ? (
              <Text style={styles.approvedText}>✅ Hyväksytty</Text>
            ) : task.isCompleted ? (
              <Text style={styles.pendingText}>⏳ Odottaa hyväksyntää</Text>
            ) : (
              <TouchableOpacity
                style={styles.completeButton}
                onPress={() => handleCompleteTask(task.id)}
              >
                <Text style={styles.completeButtonText}>
                  {t('tasks.markCompleted')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>📋</Text>
          <Text style={styles.loadingTitle}>{t('common.loading')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('tasks.title')}</Text>
        </View>

        {tasks.length > 0 ? (
          tasks.map(renderTaskCard)
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📋</Text>
            <Text style={styles.emptyStateTitle}>Ei tehtäviä</Text>
            <Text style={styles.emptyStateSubtitle}>
              Pyydä vanhempaasi luomaan tehtäviä!
            </Text>
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
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  taskCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  taskTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    flex: 1,
  },
  taskReward: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  taskDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskStatus: {
    flex: 1,
  },
  approvedText: {
    color: COLORS.success,
    fontSize: 14,
    fontWeight: '600',
  },
  pendingText: {
    color: COLORS.warning,
    fontSize: 14,
    fontWeight: '600',
  },
  completeButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  completeButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
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
  },
});

export default TasksScreen;