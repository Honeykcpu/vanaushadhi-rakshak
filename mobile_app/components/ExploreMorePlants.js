import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";

const plants = [
  { id: 1, name: "Tulsi", screen: "Tulsi", icon: "leaf-outline" },
  { id: 2, name: "Aloe Vera", screen: "AloeVera", icon: "water-outline" },
  { id: 3, name: "Ashwagandha", screen: "Ashwagandha", icon: "flower-outline" },
  { id: 4, name: "Neem", screen: "Neem", icon: "leaf-outline" },
  { id: 5, name: "Mint", screen: "Mint", icon: "leaf-outline" },
  { id: 6, name: "Brahmi", screen: "Brahmi", icon: "leaf-outline" },
  { id: 7, name: "Peppermint", screen: "Peppermint", icon: "leaf-outline" },
];

const ExploreMorePlants = ({ navigation }) => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        alignItems: "center",
        paddingBottom: 30,
        paddingTop: 20,
      }}
    >
      <Animatable.Text
        animation="fadeInDown"
        delay={300}
        style={styles.heading}
      >
        Explore More Medicinal Plants
      </Animatable.Text>

      {plants.map((plant, index) => (
        <Animatable.View
          key={plant.id}
          animation="fadeInUp"
          delay={index * 150 + 400}
          style={styles.card}
        >
          <Ionicons name={plant.icon} size={40} color="#2E7D32" />
          <View style={{ marginLeft: 15, flex: 1 }}>
            <Text style={styles.plantName}>{plant.name}</Text>
          </View>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => navigation.navigate(plant.screen)}
          >
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
        </Animatable.View>
      ))}

      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="chevron-back" size={20} color="#fff" />
        <Text style={styles.backButtonText}>Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default ExploreMorePlants;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FFF4" },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    width: "90%",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  plantName: { fontSize: 18, fontWeight: "bold", color: "#2E7D32" },
  viewButton: {
    backgroundColor: "#388E3C",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  viewButtonText: { color: "#fff", fontWeight: "bold" },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
});
