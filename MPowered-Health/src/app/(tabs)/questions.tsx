import { Text, View, StyleSheet } from "react-native";

export default function Questions() {
  return (
    <View style={styles.container}>
      <Text>care planner.</Text>
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
