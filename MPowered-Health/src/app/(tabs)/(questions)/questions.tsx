import { 
  Text, 
  StyleSheet, 
  TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { palette } from "@/constants/profile/ui";
import { useState } from "react";
import { useRouter } from "expo-router";

export default function Questions() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <Text style={styles.title}>Questions</Text>
      <Text style={styles.description}>Add questions you would like to discuss with your healthcare professional/s.</Text>
      <TouchableOpacity style={styles.addButton} onPress={() => router.push("/(tabs)/(questions)/addquestion")}>
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, 
    backgroundColor: palette.background,
    alignSelf: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
    flexGrow: 1,
    width: '100%',
    maxWidth: 560,
  },
  title: {
    marginTop: 8, 
    fontSize: 29, 
    lineHeight: 36, 
    fontWeight: '800', 
    letterSpacing: -0.6, 
    color: palette.text
  },
  description: {
    marginTop: 10, 
    fontSize: 15, 
    lineHeight: 23, 
    color: palette.muted
  },
  addButton: {
    position: "absolute",
    bottom: 104,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: palette.secondary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "black",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  addButtonText: {
    color: palette.text,
    fontSize: 32,
    fontWeight: "300",
    lineHeight: 32,
  },
});
