import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING } from '../../utils/constants';
import { formatCurrency, calculateRemaining } from '../../utils/currency';
import { SavingsGoal } from '../../types/goal';
import ProgressBar from './ProgressBar';

interface GoalCardProps {
  goal: SavingsGoal;
  onPress?: () => void;
  showProgress?: boolean;
}

const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onPress,
  showProgress = true,
}) => {
  const { t } = useTranslation();
  const remainingAmount = calculateRemaining(goal.currentAmount, goal.targetAmount);
  const isCompleted = goal.currentAmount >= goal.targetAmount;

  const getGoalIcon = (iconName: string) => {
    // In a real app, you'd map these to actual icons
    const iconMap: { [key: string]: string } = {
      bike: '🚲',
      toy: '🧸',
      game: '🎮',
      book: '📚',
      clothes: '👕',
      trip: '✈️',
      gift: '🎁',
      candy: '🍭',
    };
    return iconMap[iconName] || '🎯';
  };

  return (
    <TouchableOpacity 
      style={[styles.container, isCompleted && styles.completedContainer]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.iconContainer}>
          <Text style={styles.icon}>{getGoalIcon(goal.imageIcon)}</Text>
        </View>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>{goal.name}</Text>
          {goal.description && (
            <Text style={styles.description}>{goal.description}</Text>
          )}
        </View>
        {isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedText}>✓</Text>
          </View>
        )}
      </View>

      <View style={styles.amountContainer}>
        <Text style={styles.currentAmount}>
          {formatCurrency(goal.currentAmount)}
        </Text>
        <Text style={styles.targetAmount}>
          / {formatCurrency(goal.targetAmount)}
        </Text>
      </View>

      {showProgress && (
        <ProgressBar
          current={goal.currentAmount}
          target={goal.targetAmount}
          color={isCompleted ? COLORS.success : COLORS.primary}
          height={12}
          showPercentage={false}
        />
      )}

      <View style={styles.footer}>
        <Text style={[styles.remainingText, isCompleted && styles.completedText]}>
          {isCompleted 
            ? t('goals.completed')
            : `${t('goals.remaining')}: ${formatCurrency(remainingAmount)}`
          }
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginVertical: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  completedContainer: {
    backgroundColor: '#E8F5E8',
    borderColor: COLORS.success,
    borderWidth: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 24,
  },
  titleContainer: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  completedBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
  },
  completedText: {
    color: COLORS.surface,
    fontSize: 12,
    fontWeight: 'bold',
  },
  amountContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: SPACING.sm,
  },
  currentAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  targetAmount: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
  },
  footer: {
    marginTop: SPACING.sm,
  },
  remainingText: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default GoalCard;