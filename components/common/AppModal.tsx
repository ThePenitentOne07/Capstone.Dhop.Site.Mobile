import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const ORANGE = '#FF7120';
const ORANGE2 = '#FF7A00';

export type AppModalStatus = 'info' | 'success' | 'error';

export interface AppModalButton {
  text: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  destructive?: boolean;
}

export interface AppModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  status?: AppModalStatus;
  buttons?: AppModalButton[];
  onClose?: () => void;
}

const statusStyles: Record<
  AppModalStatus,
  { icon: string; backgroundColor: string; color: string }
> = {
  info: {
    icon: 'ℹ',
    backgroundColor: '#E0F2FE',
    color: '#0284C7',
  },
  success: {
    icon: '✓',
    backgroundColor: '#ECFDF5',
    color: '#059669',
  },
  error: {
    icon: '✕',
    backgroundColor: '#FEF2F2',
    color: '#DC2626',
  },
};

const AppModal = ({
  visible,
  title,
  message,
  status = 'info',
  buttons,
  onClose,
}: AppModalProps) => {
  const resolvedButtons =
    buttons && buttons.length > 0
      ? buttons
      : [
          {
            text: 'Đóng',
            variant: 'primary',
            onPress: onClose,
          },
        ];

  const statusConfig = statusStyles[status];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: statusConfig.backgroundColor },
            ]}
          >
            <Text style={[styles.icon, { color: statusConfig.color }]}>
              {statusConfig.icon}
            </Text>
          </View>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {message ? <Text style={styles.message}>{message}</Text> : null}
          <View style={styles.buttonRow}>
            {resolvedButtons.map((btn, idx) => {
              const isPrimary = btn.variant !== 'secondary';
              const buttonStyles = [
                styles.button,
                isPrimary ? styles.primaryButton : styles.secondaryButton,
                btn.destructive && styles.destructiveButton,
              ];
              const textStyles = [
                styles.buttonText,
                isPrimary
                  ? styles.primaryButtonText
                  : styles.secondaryButtonText,
                btn.destructive && styles.destructiveButtonText,
              ];
              return (
                <TouchableOpacity
                  key={`${btn.text}-${idx}`}
                  style={buttonStyles}
                  onPress={btn.onPress}
                  activeOpacity={0.85}
                >
                  <Text style={textStyles}>{btn.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 20,
    alignItems: 'center',
    width: '100%',
    maxWidth: 360,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  icon: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 8,
  },
  message: {
    fontSize: 15,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: 12,
    width: '100%',
  },
  button: {
    flex: 1,
    borderRadius: 24,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  primaryButton: {
    backgroundColor: ORANGE2,
    borderColor: ORANGE2,
  },
  secondaryButton: {
    backgroundColor: '#fff',
    borderColor: '#E5E7EB',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  primaryButtonText: {
    color: '#fff',
  },
  secondaryButtonText: {
    color: '#374151',
  },
  destructiveButton: {
    borderColor: '#DC2626',
  },
  destructiveButtonText: {
    color: '#DC2626',
  },
});

export default AppModal;







