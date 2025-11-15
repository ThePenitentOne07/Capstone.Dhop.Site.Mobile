import { View, Text } from 'react-native'
import React from 'react'
import { useFormatCurrency } from '../../hooks/useFormatCurrency'
import { StyleSheet } from 'react-native'
import { colors } from '../../styles/shared'
import { LinearGradient } from 'expo-linear-gradient'

const TotalBallance = () => {
    const { formatCurrency } = useFormatCurrency()
    const balance = 1000000 // Example balance
    
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[colors.primary, '#FF9500']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.label}>Total Balance</Text>
            <View style={styles.eyeIcon}>
              <Text style={styles.eyeIconText}>👁️</Text>
            </View>
          </View>
          <Text style={styles.amount}>{formatCurrency(balance)} đ</Text>
          <View style={styles.footerRow}>
            <View style={styles.footerItem}>
              <Text style={styles.footerLabel}>This Month</Text>
              <Text style={styles.footerValue}>+{formatCurrency(500000)} đ</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.footerItem}>
              <Text style={styles.footerLabel}>Spent</Text>
              <Text style={styles.footerValue}>-{formatCurrency(200000)} đ</Text>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  )
}

const styles = StyleSheet.create({
    container: {
        marginHorizontal: 20,
        marginTop: 8,
        marginBottom: 24,
        borderRadius: 20,
        overflow: 'hidden',
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 8,
    },
    gradient: {
        borderRadius: 20,
    },
    content: {
        padding: 24,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    label: {
        fontSize: 14,
        color: '#FFFFFF',
        opacity: 0.9,
        fontWeight: '500',
    },
    eyeIcon: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    eyeIconText: {
        fontSize: 16,
    },
    amount: {
        fontSize: 36,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 24,
        letterSpacing: 0.5,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.2)',
    },
    footerItem: {
        flex: 1,
    },
    footerLabel: {
        fontSize: 12,
        color: '#FFFFFF',
        opacity: 0.8,
        marginBottom: 4,
    },
    footerValue: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    divider: {
        width: 1,
        height: 40,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        marginHorizontal: 16,
    },
});

export default TotalBallance