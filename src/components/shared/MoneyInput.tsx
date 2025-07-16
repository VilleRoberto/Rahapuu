import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { formatAmountInput, validateAmount } from '../../utils/validation';
import { COLORS, SPACING, BUTTON_HEIGHTS } from '../../utils/constants';

interface MoneyInputProps {
  value: string;
  onChange: (value: string) => void;
  currency?: string;
  placeholder?: string;
  style?: ViewStyle;
  error?: string;
}

const MoneyInput: React.FC<MoneyInputProps> = ({
  value,
  onChange,
  currency = '€',
  placeholder = '0,00',
  style,
  error,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleTextChange = (text: string) => {
    const formatted = formatAmountInput(text);
    onChange(formatted);
  };

  const quickAmounts = [5, 10, 20, 50];

  const handleQuickAmount = (amount: number) => {
    onChange(amount.toString());
  };

  const inputStyle: TextStyle = {
    ...styles.input,
    borderColor: error ? COLORS.error : isFocused ? COLORS.primary : COLORS.border,
    color: error ? COLORS.error : COLORS.text,
  };

  return (
    <View style={[styles.container, style]}>
      <View style={styles.inputContainer}>
        <TextInput
          style={inputStyle}
          value={value}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textSecondary}
          keyboardType="decimal-pad"
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
        />
        <Text style={styles.currency}>{currency}</Text>
      </View>
      
      {error && <Text style={styles.errorText}>{error}</Text>}
      
      <View style={styles.quickAmounts}>
        {quickAmounts.map((amount) => (
          <TouchableOpacity
            key={amount}
            style={styles.quickButton}
            onPress={() => handleQuickAmount(amount)}
          >
            <Text style={styles.quickButtonText}>{amount}{currency}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: SPACING.sm,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 8,
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.md,
    height: BUTTON_HEIGHTS.large,
  },
  input: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'right',
    color: COLORS.text,
  },
  currency: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.textSecondary,
    marginLeft: SPACING.sm,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 12,
    marginTop: SPACING.xs,
    marginLeft: SPACING.sm,
  },
  quickAmounts: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
  },
  quickButton: {
    backgroundColor: COLORS.secondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: 20,
    flex: 1,
    marginHorizontal: SPACING.xs,
    alignItems: 'center',
  },
  quickButtonText: {
    color: COLORS.surface,
    fontSize: 14,
    fontWeight: '600',
  },
});

export default MoneyInput;