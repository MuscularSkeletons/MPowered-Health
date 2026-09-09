import { Text, View, StyleSheet } from "react-native";

export default function MyHealth() {
  return (
    <View style={styles.container}>
      <Text>my health.</Text>
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
