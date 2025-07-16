import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

// Services
import './src/services/i18n';
import DatabaseService from './src/services/database';

// Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import TreeScreen from './src/screens/TreeScreen';
import AddMoneyScreen from './src/screens/AddMoneyScreen';
import GoalsScreen from './src/screens/GoalsScreen';
import TasksScreen from './src/screens/TasksScreen';
import ParentScreen from './src/screens/ParentScreen';

// Types
import { User } from './src/types/user';
import { COLORS } from './src/utils/constants';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Tab Navigator for main app screens
const MainTabNavigator = () => {
  const { t } = useTranslation();
  
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
        },
        headerStyle: {
          backgroundColor: COLORS.primary,
        },
        headerTintColor: COLORS.surface,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Tab.Screen
        name="Tree"
        component={TreeScreen}
        options={{
          title: t('tree.title'),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🌳</Text>,
        }}
      />
      <Tab.Screen
        name="Goals"
        component={GoalsScreen}
        options={{
          title: t('goals.title'),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🎯</Text>,
        }}
      />
      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          title: t('tasks.title'),
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>📋</Text>,
        }}
      />
    </Tab.Navigator>
  );
};

const App: React.FC = () => {
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize database
      await DatabaseService.init();
      
      // TODO: Check if user exists, create demo user for now
      const demoUser = await DatabaseService.createUser({
        name: 'Demo Lapsi',
        userType: 'child',
        language: 'fi',
        treeType: 'default',
        backgroundTheme: 'forest',
      });
      
      setCurrentUser(demoUser);
      setIsInitialized(true);
    } catch (error) {
      console.error('App initialization failed:', error);
      Alert.alert(
        'Virhe',
        'Sovelluksen käynnistäminen epäonnistui. Yritä uudelleen.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>🌳</Text>
        <Text style={styles.loadingTitle}>Rahapuu</Text>
        <Text style={styles.loadingSubtitle}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (!isInitialized || !currentUser) {
    return <WelcomeScreen onUserCreated={setCurrentUser} />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Main" component={MainTabNavigator} />
        <Stack.Screen 
          name="AddMoney" 
          component={AddMoneyScreen}
          options={{
            headerShown: true,
            title: t('money.add'),
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.surface,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
        <Stack.Screen
          name="Parent"
          component={ParentScreen}
          options={{
            headerShown: true,
            title: t('parent.title'),
            headerStyle: {
              backgroundColor: COLORS.primary,
            },
            headerTintColor: COLORS.surface,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
  },
  loadingText: {
    fontSize: 60,
    marginBottom: 20,
  },
  loadingTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.surface,
    marginBottom: 8,
  },
  loadingSubtitle: {
    fontSize: 16,
    color: COLORS.surface,
    opacity: 0.8,
  },
});

export default App;