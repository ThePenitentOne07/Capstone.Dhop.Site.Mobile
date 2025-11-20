import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useState } from 'react';
import Animated, { FadeInUp, FadeInRight } from 'react-native-reanimated';

interface Step1Props {
  onNext: (numberOfDays: number) => void;
  choreographerName?: string;
  choreographerPrice?: number;
}

export default function Step1({ onNext, choreographerName = "", choreographerPrice = 0 }: Step1Props) {
  const [numberOfDays, setNumberOfDays] = useState('');

  const handleNext = () => {
    const days = parseInt(numberOfDays);
    if (days > 0) {
      onNext(days);
    }
  };

  const isValid = numberOfDays !== '' && parseInt(numberOfDays) > 0;

  const totalPrice = isValid ? parseInt(numberOfDays) * choreographerPrice : 0;

  return (
    <Animated.View entering={FadeInUp} style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Số ngày bạn muốn đặt</Text>
        <Text style={styles.subtitle}>
          Vui lòng nhập số ngày bạn muốn đặt biên đạo múa {choreographerName}
        </Text>
      </View>

      <Animated.View entering={FadeInUp.delay(200)} style={styles.inputSection}>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nhập số ngày..."
            placeholderTextColor="#9CA3AF"
            value={numberOfDays}
            onChangeText={(text) => {
              const digitsOnly = text.replace(/[^0-9]/g, '');
              const withoutLeadingZeros = digitsOnly.replace(/^0+/, '');
              setNumberOfDays(withoutLeadingZeros);
            }}
            keyboardType="number-pad"
          />
          <Text style={styles.inputLabel}>ngày</Text>
        </View>
      </Animated.View>

      {/* {isValid && (
        <Animated.View entering={FadeInRight.delay(400)} style={styles.priceCard}>
          <Text style={styles.priceLabel}>Tổng cộng:</Text>
          <Text style={styles.priceValue}>{totalPrice.toLocaleString('vi-VN')} ₫</Text>
          <Text style={styles.priceBreakdown}>
            {numberOfDays} ngày × {choreographerPrice.toLocaleString('vi-VN')} ₫/ngày
          </Text>
        </Animated.View>
      )} */}

      <Animated.View entering={FadeInUp.delay(300)} style={styles.nextButtonContainer}>
        <TouchableOpacity
          style={[styles.nextButton, !isValid && styles.nextButtonDisabled]}
          onPress={handleNext}
          disabled={!isValid}
          activeOpacity={0.8}
        >
          <Text style={[styles.nextButtonText, !isValid && styles.nextButtonTextDisabled]}>
            Tiếp theo
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  inputSection: {
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    paddingHorizontal: 16,
    height: 56,
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  inputLabel: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 8,
  },
  priceCard: {
    backgroundColor: '#FF7A00',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
  },
  priceLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 4,
  },
  priceValue: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  priceBreakdown: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  nextButtonContainer: {
    marginTop: 'auto',
    paddingBottom: 40,
  },
  nextButton: {
    backgroundColor: '#FF7A00',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#FF7A00',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  nextButtonDisabled: {
    backgroundColor: '#E5E7EB',
    shadowOpacity: 0,
    elevation: 0,
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  nextButtonTextDisabled: {
    color: '#9CA3AF',
  },
});

