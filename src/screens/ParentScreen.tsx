import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import DatabaseService from '../services/database';
import { COLORS, SPACING } from '../utils/constants';
import { Transaction } from '../types/transaction';
import { formatCurrency } from '../utils/currency';

const ParentScreen: React.FC = () => {
  const { t } = useTranslation();
  const navigation = useNavigation();
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [pendingTransactions, setPendingTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // For demo purposes, use simple PIN
  const DEMO_PIN = '1234';

  useEffect(() => {
    if (isAuthenticated) {
      loadPendingTransactions();
    }
  }, [isAuthenticated]);

  const loadPendingTransactions = async () => {
    try {
      const userId = 'user_demo_123';
      const transactions = await DatabaseService.getPendingTransactions(userId);
      setPendingTransactions(transactions);
    } catch (error) {
      console.error('Error loading pending transactions:', error);
    }
  };

  const handlePinSubmit = () => {
    if (pinInput === DEMO_PIN) {
      setIsAuthenticated(true);
      setPinInput('');
    } else {
      Alert.alert('Virhe', 'Väärä PIN-koodi');
      setPinInput('');
    }
  };

  const handleApproveTransaction = async (transactionId: string) => {
    setIsLoading(true);
    try {
      await DatabaseService.approveTransaction(transactionId, 'parent_demo');
      Alert.alert('Onnistui', 'Tapahtuma hyväksytty!');
      loadPendingTransactions();
    } catch (error) {
      console.error('Error approving transaction:', error);
      Alert.alert('Virhe', 'Hyväksyminen epäonnistui');
    } finally {
      setIsLoading(false);
    }
  };

  const createDemoData = async () => {
    try {
      const userId = 'user_demo_123';
      
      // Create demo goal
      await DatabaseService.createGoal({
        userId,
        name: 'Uusi pyörä',
        targetAmount: 150,
        currentAmount: 0,
        imageIcon: 'bike',
        isCompleted: false,
      });

      // Create demo task
      await DatabaseService.createTask({
        userId,
        title: 'Siivoa huone',
        description: 'Siivoa oma huone ja järjestä tavarat',
        rewardAmount: 5,
        isCompleted: false,
        isApproved: false,
      });

      Alert.alert('Onnistui', 'Demo-tiedot luotu!');
    } catch (error) {
      console.error('Error creating demo data:', error);
      Alert.alert('Virhe', 'Demo-tietojen luonti epäonnistui');
    }
  };

  const renderTransactionCard = (transaction: Transaction) => {
    return (
      <View key={transaction.id} style={styles.transactionCard}>
        <View style={styles.transactionHeader}>
          <Text style={styles.transactionAmount}>
            {formatCurrency(transaction.amount)}
          </Text>
          <Text style={styles.transactionDate}>
            {new Date(transaction.createdAt).toLocaleDateString('fi-FI')}
          </Text>
        </View>
        
        {transaction.description && (
          <Text style={styles.transactionDescription}>
            {transaction.description}
          </Text>
        )}
        
        <View style={styles.transactionFooter}>
          <Text style={styles.transactionType}>
            {transaction.transactionType === 'saving' ? 'Säästö' : 'Tehtävä'}
          </Text>
          
          <TouchableOpacity
            style={styles.approveButton}
            onPress={() => handleApproveTransaction(transaction.id)}
            disabled={isLoading}
          >
            <Text style={styles.approveButtonText}>
              {isLoading ? 'Hyväksyy...' : 'Hyväksy'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.pinContainer}>
          <Text style={styles.pinTitle}>Syötä PIN-koodi</Text>
          <Text style={styles.pinSubtitle}>Demo PIN: 1234</Text>
          
          <TextInput
            style={styles.pinInput}
            value={pinInput}
            onChangeText={setPinInput}
            placeholder="PIN-koodi"
            secureTextEntry
            keyboardType="numeric"
            maxLength={4}
          />
          
          <TouchableOpacity
            style={styles.pinButton}
            onPress={handlePinSubmit}
            disabled={pinInput.length !== 4}
          >
            <Text style={styles.pinButtonText}>Kirjaudu sisään</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('parent.title')}</Text>
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              setIsAuthenticated(false);
              navigation.goBack();
            }}
          >
            <Text style={styles.logoutButtonText}>Kirjaudu ulos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Odottavat tapahtumat</Text>
          
          {pendingTransactions.length > 0 ? (
            pendingTransactions.map(renderTransactionCard)
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                Ei odottavia tapahtumia
              </Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Toiminnot</Text>
          
          <TouchableOpacity
            style={styles.actionButton}
            onPress={createDemoData}
          >
            <Text style={styles.actionButtonText}>
              📝 Luo demo-tiedot
            </Text>
          </TouchableOpacity>
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
  pinContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  pinTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  pinSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xl,
  },
  pinInput: {
    borderWidth: 2,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: SPACING.md,
    fontSize: 20,
    textAlign: 'center',
    width: 120,
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.surface,
  },
  pinButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: 8,
  },
  pinButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
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
  logoutButton: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  logoutButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginVertical: SPACING.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  transactionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  transactionDate: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  transactionDescription: {
    fontSize: 14,
    color: COLORS.text,
    marginBottom: SPACING.sm,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionType: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
  approveButton: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 8,
  },
  approveButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  emptyStateText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  actionButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: 8,
    marginBottom: SPACING.sm,
  },
  actionButtonText: {
    color: COLORS.surface,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default ParentScreen;