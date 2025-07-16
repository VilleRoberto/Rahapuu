import React, { useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useTranslation } from 'react-i18next';
import { COLORS, SPACING } from '../../utils/constants';
import { TreeProgress } from '../../types/tree';
import { formatCurrency } from '../../utils/currency';

const { width: screenWidth } = Dimensions.get('window');

interface AnimatedTreeProps {
  treeProgress: TreeProgress;
  onTreePress?: () => void;
  isGrowing?: boolean;
}

const AnimatedTree: React.FC<AnimatedTreeProps> = ({
  treeProgress,
  onTreePress,
  isGrowing = false,
}) => {
  const { t } = useTranslation();
  const treeRef = useRef<View>(null);

  const getTreeHeight = () => {
    // Base height + growth based on level
    return 100 + (treeProgress.treeLevel * 20);
  };

  const getTreeWidth = () => {
    // Base width + growth based on level
    return 60 + (treeProgress.treeLevel * 10);
  };

  const renderTreeTrunk = () => {
    const height = getTreeHeight();
    const width = getTreeWidth();
    
    return (
      <View style={[styles.trunk, { height: height * 0.4, width: width * 0.3 }]}>
        <Text style={styles.trunkEmoji}>🌳</Text>
      </View>
    );
  };

  const renderTreeCanopy = () => {
    const height = getTreeHeight();
    const width = getTreeWidth();
    
    return (
      <View style={[styles.canopy, { height: height * 0.6, width: width }]}>
        <Text style={[styles.canopyEmoji, { fontSize: 40 + treeProgress.treeLevel * 5 }]}>
          🌲
        </Text>
      </View>
    );
  };

  const renderLeaves = () => {
    const leaves = [];
    for (let i = 0; i < treeProgress.leavesCount; i++) {
      const randomTop = Math.random() * 60 + 10;
      const randomLeft = Math.random() * 80 + 10;
      
      leaves.push(
        <View
          key={`leaf-${i}`}
          style={[
            styles.decoration,
            {
              top: `${randomTop}%`,
              left: `${randomLeft}%`,
            },
          ]}
        >
          <Text style={styles.leafEmoji}>🍃</Text>
        </View>
      );
    }
    return leaves;
  };

  const renderFruits = () => {
    const fruits = [];
    for (let i = 0; i < treeProgress.fruitsCount; i++) {
      const randomTop = Math.random() * 50 + 20;
      const randomLeft = Math.random() * 70 + 15;
      
      fruits.push(
        <View
          key={`fruit-${i}`}
          style={[
            styles.decoration,
            {
              top: `${randomTop}%`,
              left: `${randomLeft}%`,
            },
          ]}
        >
          <Text style={styles.fruitEmoji}>🍎</Text>
        </View>
      );
    }
    return fruits;
  };

  const renderFlowers = () => {
    const flowers = [];
    for (let i = 0; i < treeProgress.flowersCount; i++) {
      const randomTop = Math.random() * 40 + 10;
      const randomLeft = Math.random() * 60 + 20;
      
      flowers.push(
        <View
          key={`flower-${i}`}
          style={[
            styles.decoration,
            {
              top: `${randomTop}%`,
              left: `${randomLeft}%`,
            },
          ]}
        >
          <Text style={styles.flowerEmoji}>🌸</Text>
        </View>
      );
    }
    return flowers;
  };

  const renderPetCompanion = () => {
    if (!treeProgress.decorations?.animals?.length) return null;
    
    return (
      <View style={styles.petContainer}>
        <Text style={styles.petEmoji}>🐱</Text>
      </View>
    );
  };

  const renderGrowthEffect = () => {
    if (!isGrowing) return null;
    
    return (
      <View style={styles.growthEffect}>
        <Text style={styles.sparkle}>✨</Text>
        <Text style={styles.sparkle}>⭐</Text>
        <Text style={styles.sparkle}>✨</Text>
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onTreePress}
      activeOpacity={0.8}
    >
      <View style={styles.treeContainer} ref={treeRef}>
        {renderTreeCanopy()}
        {renderTreeTrunk()}
        {renderLeaves()}
        {renderFruits()}
        {renderFlowers()}
        {renderPetCompanion()}
        {renderGrowthEffect()}
      </View>
      
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{t('tree.level')}</Text>
          <Text style={styles.statValue}>{treeProgress.treeLevel}</Text>
        </View>
        
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>{t('tree.totalSaved')}</Text>
          <Text style={styles.statValue}>
            {formatCurrency(treeProgress.totalSaved)}
          </Text>
        </View>
      </View>
      
      <View style={styles.decorationStats}>
        <View style={styles.decorationItem}>
          <Text style={styles.decorationEmoji}>🍃</Text>
          <Text style={styles.decorationCount}>{treeProgress.leavesCount}</Text>
        </View>
        
        <View style={styles.decorationItem}>
          <Text style={styles.decorationEmoji}>🍎</Text>
          <Text style={styles.decorationCount}>{treeProgress.fruitsCount}</Text>
        </View>
        
        <View style={styles.decorationItem}>
          <Text style={styles.decorationEmoji}>🌸</Text>
          <Text style={styles.decorationCount}>{treeProgress.flowersCount}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    backgroundColor: COLORS.background,
    borderRadius: 20,
    margin: SPACING.md,
  },
  treeContainer: {
    position: 'relative',
    width: screenWidth * 0.6,
    height: 200,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  trunk: {
    backgroundColor: '#8B4513',
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 0,
  },
  trunkEmoji: {
    fontSize: 20,
    opacity: 0.7,
  },
  canopy: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: '30%',
  },
  canopyEmoji: {
    color: COLORS.primary,
  },
  decoration: {
    position: 'absolute',
    zIndex: 2,
  },
  leafEmoji: {
    fontSize: 16,
  },
  fruitEmoji: {
    fontSize: 18,
  },
  flowerEmoji: {
    fontSize: 16,
  },
  petContainer: {
    position: 'absolute',
    bottom: -10,
    right: 10,
  },
  petEmoji: {
    fontSize: 24,
  },
  growthEffect: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  sparkle: {
    fontSize: 20,
    position: 'absolute',
    // Add animation properties here
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: SPACING.lg,
    paddingHorizontal: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  decorationStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '60%',
    marginTop: SPACING.md,
  },
  decorationItem: {
    alignItems: 'center',
  },
  decorationEmoji: {
    fontSize: 20,
    marginBottom: SPACING.xs,
  },
  decorationCount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
});

export default AnimatedTree;