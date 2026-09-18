import { Text, View, StyleSheet } from "react-native";

export default function ManageProfile() {
  return (
    <View style={styles.container}>
      <Text>Edit Profile</Text>
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
