import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';

import GoalCard from '../components/shared/GoalCard';
import DatabaseService from '../services/database';
import { COLORS, SPACING } from '../utils/constants';
import { SavingsGoal } from '../types/goal';
import { validateGoalName, validateAmount } from '../utils/validation';

const GoalsScreen: React.FC = () => {
  const { t } = useTranslation();
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newGoalName, setNewGoalName] = useState('');
  const [newGoalAmount, setNewGoalAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const userId = 'user_demo_123';
      const goalsData = await DatabaseService.getGoalsByUserId(userId);
      setGoals(goalsData);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const handleAddGoal = async () => {
    if (!validateGoalName(newGoalName)) {
      Alert.alert('Virhe', 'Syötä kelvollinen nimi');
      return;
    }
    
    if (!validateAmount(newGoalAmount)) {
      Alert.alert('Virhe', 'Syötä kelvollinen summa');
      return;
    }

    setIsLoading(true);
    try {
      const userId = 'user_demo_123';
      
      await DatabaseService.createGoal({
        userId,
        name: newGoalName,
        targetAmount: parseFloat(newGoalAmount),
        currentAmount: 0,
        imageIcon: 'gift',
        isCompleted: false,
      });

      setIsModalVisible(false);
      setNewGoalName('');
      setNewGoalAmount('');
      loadGoals();
    } catch (error) {
      console.error('Error creating goal:', error);
      Alert.alert('Virhe', 'Tavoitteen luominen epäonnistui');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('goals.title')}</Text>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setIsModalVisible(true)}
          >
            <Text style={styles.addButtonText}>+</Text>
          </TouchableOpacity>
        </View>

        {goals.length > 0 ? (
          goals.map((goal) => (
            <GoalCard key={goal.id} goal={goal} />
          ))
        ) : (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>🎯</Text>
            <Text style={styles.emptyStateTitle}>Ei tavoitteita</Text>
            <Text style={styles.emptyStateSubtitle}>
              Luo ensimmäinen säästötavoitteesi!
            </Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('goals.addNew')}</Text>
            
            <TextInput
              style={styles.input}
              value={newGoalName}
              onChangeText={setNewGoalName}
              placeholder={t('goals.name')}
            />
            
            <TextInput
              style={styles.input}
              value={newGoalAmount}
              onChangeText={setNewGoalAmount}
              placeholder={t('goals.targetAmount')}
              keyboardType="decimal-pad"
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.cancelButtonText}>Peruuta</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleAddGoal}
                disabled={isLoading}
              >
                <Text style={styles.saveButtonText}>
                  {isLoading ? 'Tallentaa...' : 'Tallenna'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: COLORS.surface,
    fontSize: 24,
    fontWeight: 'bold',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: SPACING.lg,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  input: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  modalButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: SPACING.xs,
  },
  cancelButton: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default GoalsScreen;