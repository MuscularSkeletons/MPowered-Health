import { Text, View, StyleSheet } from "react-native";

export default function Onboarding() {
  return (
    <View style={styles.container}>
      <Text>onboarding.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
