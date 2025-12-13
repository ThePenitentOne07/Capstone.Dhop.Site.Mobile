import React, { useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { sharedStyles, colors } from "../styles/shared";
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from "react-native";
import TotalBallance from "../components/Wallet/TotalBallance";
import Animated, { 
  FadeInDown, 
  FadeInRight, 
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing
} from "react-native-reanimated";

function Wallet() {
  return (
    <SafeAreaView style={[sharedStyles.screenRoot, styles.container]}>
      <ScrollView 
        style={sharedStyles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Total Balance Card */}
        <TotalBallance />

        {/* Quick Actions */}
        {/* <Animated.View 
          style={styles.section}
          entering={FadeInDown.delay(200).duration(300)}
        >
          <Animated.Text 
            style={styles.sectionTitle}
            entering={FadeIn.delay(250).duration(300)}
          >
            Thao tác
          </Animated.Text>
          <View style={styles.quickActions}>
            <AnimatedActionButton
              index={0}
              icon="💸"
              label="Nạp tiền"
            />
            <AnimatedActionButton
              index={1}
              icon="📥"
              label="Rút tiền"
            />
            <AnimatedActionButton
              index={2}
              icon="📊"
              label="History"
            />
          </View>
        </Animated.View> */}

        {/* Recent Transactions */}
        {/* <Animated.View 
          style={styles.section}
          entering={FadeInDown.delay(400).duration(300)}
        >
          <Animated.View 
            style={styles.sectionHeader}
            entering={FadeIn.delay(450).duration(300)}
          >
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </Animated.View>
          
          <View style={styles.transactionsList}>
            <TransactionItem 
              index={0}
              icon="💃"
              title="Dance Class Payment"
              date="Today, 2:30 PM"
              amount="-500,000"
              type="outgoing"
            />
            <TransactionItem 
              index={1}
              icon="💰"
              title="Refund Received"
              date="Yesterday, 10:15 AM"
              amount="+200,000"
              type="incoming"
            />
            <TransactionItem 
              index={2}
              icon="🎭"
              title="Choreography Booking"
              date="2 days ago"
              amount="-1,500,000"
              type="outgoing"
            />
            <TransactionItem 
              index={3}
              icon="💵"
              title="Top Up"
              date="3 days ago"
              amount="+2,000,000"
              type="incoming"
            />
          </View>
        </Animated.View> */}
      </ScrollView>
    </SafeAreaView>
  );
}

interface AnimatedActionButtonProps {
  index: number;
  icon: string;
  label: string;
}

const AnimatedActionButton: React.FC<AnimatedActionButtonProps> = ({ index, icon, label }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withTiming(0.95, { 
      duration: 150,
      easing: Easing.out(Easing.ease)
    });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { 
      duration: 150,
      easing: Easing.out(Easing.ease)
    });
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(300 + index * 50).duration(250)}
      style={animatedStyle}
    >
      <TouchableOpacity
        style={styles.actionButton}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Animated.View style={styles.actionIcon}>
          <Text style={styles.actionIconText}>{icon}</Text>
        </Animated.View>
        <Text style={styles.actionLabel}>{label}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

interface TransactionItemProps {
  index: number;
  icon: string;
  title: string;
  date: string;
  amount: string;
  type: 'incoming' | 'outgoing';
}

const TransactionItem: React.FC<TransactionItemProps> = ({ index, icon, title, date, amount, type }) => {
  const scale = useSharedValue(1);
  const translateX = useSharedValue(30);
  const opacity = useSharedValue(0);

  useEffect(() => {
    const delay = 500 + index * 50;
    translateX.value = withDelay(
      delay,
      withTiming(0, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      })
    );
    opacity.value = withDelay(
      delay,
      withTiming(1, {
        duration: 300,
        easing: Easing.out(Easing.ease),
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  const handlePressIn = () => {
    scale.value = withTiming(0.98, { 
      duration: 150,
      easing: Easing.out(Easing.ease)
    });
  };

  const handlePressOut = () => {
    scale.value = withTiming(1, { 
      duration: 150,
      easing: Easing.out(Easing.ease)
    });
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={styles.transactionItem}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Animated.View
          style={styles.transactionIconContainer}
          entering={FadeIn.delay(550 + index * 50).duration(250)}
        >
          <Text style={styles.transactionIcon}>{icon}</Text>
        </Animated.View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionTitle}>{title}</Text>
          <Text style={styles.transactionDate}>{date}</Text>
        </View>
        <Animated.Text
          style={[
            styles.transactionAmount,
            type === 'incoming' ? styles.amountIncoming : styles.amountOutgoing
          ]}
          entering={FadeIn.delay(600 + index * 50).duration(250)}
        >
          {amount} đ
        </Animated.Text>
      </TouchableOpacity>
    </Animated.View>
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
    color: colors.text.primary,
    fontFamily: 'RobotoMono_700Bold',
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
    color: colors.text.primary,
    fontFamily: 'RobotoMono_700Bold',
  },
  seeAllText: {
    fontSize: 14,
    color: colors.primary,
    fontFamily: 'RobotoMono_700Bold',
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
    fontFamily: 'RobotoMono_400Regular',
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
    color: colors.text.primary,
    marginBottom: 4,
    fontFamily: 'RobotoMono_700Bold',
  },
  transactionDate: {
    fontSize: 12,
    color: colors.text.muted,
    fontFamily: 'RobotoMono_400Regular',
  },
  transactionAmount: {
    fontSize: 16,
    fontFamily: 'RobotoMono_700Bold',
  },
  amountIncoming: {
    color: '#10B981',
  },
  amountOutgoing: {
    color: colors.primary,
  },
});

export default Wallet;
