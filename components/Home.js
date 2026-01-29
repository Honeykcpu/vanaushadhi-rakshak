// File: components/Home.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";

const plantData = [
  {
    id: 1,
    name: "Tulsi",
    description: "Holy Basil for immunity",
    icon: "leaf-outline",
    screen: "Tulsi",
  },
  {
    id: 2,
    name: "Aloe Vera",
    description: "Skin and health benefits",
    icon: "water-outline",
    screen: "AloeVera",
  },
  {
    id: 3,
    name: "Ashwagandha",
    description: "Stress relief herb",
    icon: "flower-outline",
    screen: "Ashwagandha",
  },
];

const Home = ({ navigation }) => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ alignItems: "center", paddingBottom: 30 }}
    >
      <Animatable.View animation="fadeInDown" delay={300}>
        <Text style={styles.appName}>Vanaushadhi Rakshak</Text>
      </Animatable.View>

      <LinearGradient colors={["#82C784", "#4DB6AC"]} style={styles.header}>
        <Text style={[styles.heading, { color: "#2E7D32" }]}>
          Medicinal Plants Awareness & Protection
        </Text>
      </LinearGradient>

      <Animatable.View animation="fadeInUp" delay={500} style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={24} color="#2E7D32" />
        <Text style={styles.infoText}>
          Learn about medicinal plants, their benefits, usage, and conservation.
        </Text>
      </Animatable.View>

      {/* Plant Cards */}
      {plantData.map((plant, index) => (
        <Animatable.View
          key={plant.id}
          animation="fadeInUp"
          delay={index * 200 + 800}
          style={styles.card}
        >
          <Ionicons name={plant.icon} size={40} color="#2E7D32" />
          <View style={{ marginLeft: 15, flex: 1 }}>
            <Text style={styles.plantName}>{plant.name}</Text>
            <Text style={styles.plantDesc}>{plant.description}</Text>
          </View>
          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => navigation.navigate(plant.screen)}
          >
            <Text style={styles.viewButtonText}>View</Text>
          </TouchableOpacity>
        </Animatable.View>
      ))}

      {/* Feature Buttons */}
      <Animatable.View animation="zoomIn" delay={1400}>
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => navigation.navigate("ExploreAllPlants")}
        >
          <Text style={styles.exploreButtonText}>Explore All Plants</Text>
        </TouchableOpacity>
      </Animatable.View>

      <Animatable.View animation="zoomIn" delay={1500}>
        <TouchableOpacity
          style={[styles.exploreButton, { backgroundColor: "#4CAF50" }]}
          onPress={() => navigation.navigate("GeoTaggedPlantInput")}
        >
          <Text style={styles.exploreButtonText}>Add GeoTagged Plant</Text>
        </TouchableOpacity>
      </Animatable.View>

      <Animatable.View animation="zoomIn" delay={1550}>
        <TouchableOpacity
          style={styles.exploreButton}
          onPress={() => navigation.navigate("ClimateData")}
        >
          <Text style={styles.exploreButtonText}>View Climate Data</Text>
        </TouchableOpacity>
      </Animatable.View>

      {/* Back to Welcome */}
      <TouchableOpacity
        style={styles.backButtonBottom}
        onPress={() => navigation.replace("Welcome")}
      >
        <Ionicons name="chevron-back" size={20} color="#fff" />
        <Text style={styles.backButtonText}>Back to Welcome</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default Home;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FFF4" },
  appName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    textAlign: "center",
    marginTop: 20,
    marginBottom: 10,
  },
  header: {
    width: "90%",
    paddingVertical: 15,
    alignItems: "center",
    borderRadius: 15,
    marginBottom: 15,
  },
  heading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
  },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#C8E6C9",
    width: "90%",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    alignItems: "flex-start",
  },
  infoText: {
    fontSize: 16,
    color: "#2E7D32",
    marginLeft: 10,
    textAlign: "justify",
    flex: 1,
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
  plantName: { fontSize: 20, fontWeight: "bold", color: "#2E7D32" },
  plantDesc: { fontSize: 14, color: "#555", marginTop: 4 },
  viewButton: {
    backgroundColor: "#388E3C",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  viewButtonText: { color: "#fff", fontWeight: "bold" },
  exploreButton: {
    flexDirection: "row",
    backgroundColor: "#2E7D32",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  exploreButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginLeft: 5,
  },
  backButtonBottom: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#388E3C",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 30,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});