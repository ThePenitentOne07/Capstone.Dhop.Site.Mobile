import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { sharedStyles, colors } from "../styles/shared";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";
import TotalBallance from "../components/Wallet/TotalBallance";

function Wallet() {
  return (
    <SafeAreaView style={[sharedStyles.screenRoot, styles.container]}>
      <ScrollView 
        style={sharedStyles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Wallet</Text>
          <TouchableOpacity style={styles.iconButton}>
            <Text style={styles.iconText}>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Total Balance Card */}
        <TotalBallance />

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>💸</Text>
              </View>
              <Text style={styles.actionLabel}>Add Money</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>📤</Text>
              </View>
              <Text style={styles.actionLabel}>Send</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>📥</Text>
              </View>
              <Text style={styles.actionLabel}>Receive</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <View style={styles.actionIcon}>
                <Text style={styles.actionIconText}>📊</Text>
              </View>
              <Text style={styles.actionLabel}>History</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.transactionsList}>
            <TransactionItem 
              icon="💃"
              title="Dance Class Payment"
              date="Today, 2:30 PM"
              amount="-500,000"
              type="outgoing"
            />
            <TransactionItem 
              icon="💰"
              title="Refund Received"
              date="Yesterday, 10:15 AM"
              amount="+200,000"
              type="incoming"
            />
            <TransactionItem 
              icon="🎭"
              title="Choreography Booking"
              date="2 days ago"
              amount="-1,500,000"
              type="outgoing"
            />
            <TransactionItem 
              icon="💵"
              title="Top Up"
              date="3 days ago"
              amount="+2,000,000"
              type="incoming"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

interface TransactionItemProps {
  icon: string;
  title: string;
  date: string;
  amount: string;
  type: 'incoming' | 'outgoing';
}

const TransactionItem: React.FC<TransactionItemProps> = ({ icon, title, date, amount, type }) => {
  return (
    <TouchableOpacity style={styles.transactionItem}>
      <View style={styles.transactionIconContainer}>
        <Text style={styles.transactionIcon}>{icon}</Text>
      </View>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionTitle}>{title}</Text>
        <Text style={styles.transactionDate}>{date}</Text>
      </View>
      <Text style={[
        styles.transactionAmount,
        type === 'incoming' ? styles.amountIncoming : styles.amountOutgoing
      ]}>
        {amount} đ
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background.secondary,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text.primary,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconText: {
    fontSize: 18,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text.primary,
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIconText: {
    fontSize: 24,
  },
  actionLabel: {
    fontSize: 12,
    color: colors.text.secondary,
    fontWeight: '500',
  },
  transactionsList: {
    marginTop: 8,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  transactionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  transactionIcon: {
    fontSize: 24,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text.primary,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
    color: colors.text.muted,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: '700',
  },
  amountIncoming: {
    color: '#10B981',
  },
  amountOutgoing: {
    color: colors.primary,
  },
});

export default Wallet;
