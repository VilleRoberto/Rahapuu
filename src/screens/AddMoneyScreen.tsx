import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import MoneyInput from '../components/shared/MoneyInput';
import DatabaseService from '../services/database';
import { COLORS, SPACING } from '../utils/constants';
import { validateAmount } from '../utils/validation';
import { SavingsGoal } from '../types/goal';

const AddMoneyScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [goals, setGoals] = useState<SavingsGoal[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const userId = 'user_demo_123'; // Demo user ID
      const goalsData = await DatabaseService.getGoalsByUserId(userId);
      setGoals(goalsData);
    } catch (error) {
      console.error('Error loading goals:', error);
    }
  };

  const handleSave = async () => {
    if (!validateAmount(amount)) {
      Alert.alert('Virhe', 'Syötä kelvollinen summa');
      return;
    }

    setIsLoading(true);
    try {
      const userId = 'user_demo_123'; // Demo user ID
      
      await DatabaseService.createTransaction({
        userId,
        goalId: selectedGoal,
        amount: parseFloat(amount),
        description: description || undefined,
        transactionType: 'saving',
        status: 'pending',
      });

      Alert.alert(
        'Onnistui!',
        'Säästösi on lisätty ja odottaa vanhemman hyväksyntää.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error) {
      console.error('Error saving transaction:', error);
      Alert.alert('Virhe', 'Säästöjen tallentaminen epäonnistui');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.content}>
          <Text style={styles.title}>{t('money.add')}</Text>
          
          <MoneyInput
            value={amount}
            onChange={setAmount}
            placeholder="0,00"
            error={amount && !validateAmount(amount) ? 'Virheellinen summa' : undefined}
          />

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t('money.description')}</Text>
            <TextInput
              style={styles.textInput}
              value={description}
              onChangeText={setDescription}
              placeholder="Esim. Viikkoraha, lahjaraha..."
              multiline
              numberOfLines={2}
            />
          </View>

          {goals.length > 0 && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>{t('money.selectGoal')}</Text>
              <View style={styles.goalsList}>
                <TouchableOpacity
                  style={[
                    styles.goalOption,
                    !selectedGoal && styles.selectedGoal,
                  ]}
                  onPress={() => setSelectedGoal(null)}
                >
                  <Text style={styles.goalOptionText}>
                    Yleiset säästöt
                  </Text>
                </TouchableOpacity>
                
                {goals.map((goal) => (
                  <TouchableOpacity
                    key={goal.id}
                    style={[
                      styles.goalOption,
                      selectedGoal === goal.id && styles.selectedGoal,
                    ]}
                    onPress={() => setSelectedGoal(goal.id)}
                  >
                    <Text style={styles.goalOptionText}>
                      {goal.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.cancelButtonText}>
                {t('money.cancel')}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
              disabled={isLoading || !validateAmount(amount)}
            >
              <Text style={styles.saveButtonText}>
                {isLoading ? 'Tallentaa...' : t('money.save')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  content: {
    padding: SPACING.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center',
  },
  inputGroup: {
    marginVertical: SPACING.md,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  textInput: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  goalsList: {
    marginTop: SPACING.sm,
  },
  goalOption: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    backgroundColor: COLORS.surface,
  },
  selectedGoal: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary + '20',
  },
  goalOptionText: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.xl,
  },
  button: {
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

export default AddMoneyScreen;