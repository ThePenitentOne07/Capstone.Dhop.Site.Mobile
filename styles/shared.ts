import { StyleSheet } from 'react-native';

export const sharedStyles = StyleSheet.create({
  screenRoot: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    color: "#111827",
    fontFamily: 'RobotoMono_700Bold',
  },
  showMore: {
    fontSize: 14,
    color: "#FF7A00",
    fontFamily: 'RobotoMono_400Regular',
  },
});

export const colors = {
  primary: '#FF7A00',
  secondary: '#F3F4F6',
  text: {
    primary: '#111827',
    secondary: '#374151',
    muted: '#6B7280',
  },
  background: {
    primary: '#FFFFFF',
    secondary: '#F9FAFB',
  },
  border: '#E5E7EB',
};

