import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import { useFormatCurrency } from '../../hooks/formatCurrency';

export default function Introduction({ props }: { props: { title: string, name: string, price: number, yearExperience: number, about: string } }) {
  
  const { formatCurrency } = useFormatCurrency();
  return (
    <View style={styles.content}>
          <Text style={styles.title}>{props.title}</Text>
          {!!props.name && <Text style={styles.subtitle}>tên : {props.name}</Text>}

          <View style={styles.metaRow}>
            {!!props.price && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{formatCurrency(props.price)}</Text>
              </View>
            )}
            {!!props.yearExperience && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{props.yearExperience} yrs exp</Text>
              </View>
            )}
           
          </View>

          <Text style={styles.sectionTitle}>About</Text>
          <Text style={styles.paragraph}>
           {props.about}
          </Text>

         
        </View>
  )
}
const styles = StyleSheet.create({
    content: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 32,
      },
      title: {
        fontSize: 22,
        fontWeight: "700",
        color: "#111827",
      },
      subtitle: {
        marginTop: 4,
        fontSize: 14,
        color: "#6B7280",
      },
      metaRow: {
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap",
        gap: 8,
        marginTop: 12,
      },
      badge: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: "#FF7A00",
      },
      badgeText: {
        color: "#FFFFFF",
        fontWeight: "600",
      },
      badgeMuted: {
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
        backgroundColor: "#F3F4F6",
      },
      badgeMutedText: {
        color: "#374151",
        fontWeight: "500",
      },
      sectionTitle: {
        marginTop: 20,
        marginBottom: 8,
        fontSize: 16,
        fontWeight: "700",
        color: "#111827",
      },
      paragraph: {
        fontSize: 14,
        color: "#374151",
        lineHeight: 20,
      },
})