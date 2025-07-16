import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { COLORS, SPACING } from '../../utils/constants';
import { formatProgress } from '../../utils/currency';

interface ProgressBarProps {
  current: number;
  target: number;
  color?: string;
  height?: number;
  showPercentage?: boolean;
  animated?: boolean;
  style?: ViewStyle;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
  current,
  target,
  color = COLORS.primary,
  height = 20,
  showPercentage = true,
  animated = false,
  style,
}) => {
  const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0;
  const isCompleted = current >= target;

  const progressColor = isCompleted ? COLORS.success : color;
  const progressStyle: ViewStyle = {
    width: `${percentage}%`,
    height: height,
    backgroundColor: progressColor,
    borderRadius: height / 2,
    ...(animated && {
      // Add animation properties here if needed
    }),
  };

  return (
    <View style={[styles.container, style]}>
      <View style={[styles.track, { height }]}>
        <View style={progressStyle} />
      </View>
      {showPercentage && (
        <Text style={[styles.percentage, { color: progressColor }]}>
          {formatProgress(current, target)}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: SPACING.sm,
  },
  track: {
    flex: 1,
    backgroundColor: COLORS.border,
    borderRadius: 10,
    overflow: 'hidden',
  },
  percentage: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: SPACING.sm,
    minWidth: 45,
    textAlign: 'right',
  },
});

export default ProgressBar;