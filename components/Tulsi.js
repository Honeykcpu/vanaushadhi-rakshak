import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const Tulsi = ({ navigation }) => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        alignItems: "center",
        paddingBottom: 30,
        paddingTop: 20,
      }}
    >

      {/* Plant Image */}
      <Animatable.Image
        animation="fadeInDown"
        duration={1500}
        source={require("../assets/Tulsi.png")}
        style={styles.plantImage}
        resizeMode="contain"
      />

      {/* Plant Name */}
      <Animatable.Text
        animation="fadeInUp"
        delay={500}
        style={styles.plantName}
      >
        Tulsi
      </Animatable.Text>

      {/* Detailed Description */}
      <Animatable.View animation="fadeInUp" delay={700} style={styles.infoBox}>
        <Text style={styles.infoHeading}>Health Benefits:</Text>
        <View style={styles.point}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#2E7D32" />
          <Text style={styles.infoText}>Boosts immunity</Text>
        </View>
        <View style={styles.point}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#2E7D32" />
          <Text style={styles.infoText}>Reduces stress</Text>
        </View>
        <View style={styles.point}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#2E7D32" />
          <Text style={styles.infoText}>Improves respiratory health</Text>
        </View>

        <Text style={styles.infoHeading}>Uses:</Text>
        <View style={styles.point}>
          <Ionicons name="leaf-outline" size={20} color="#2E7D32" />
          <Text style={styles.infoText}>Teas and extracts</Text>
        </View>
        <View style={styles.point}>
          <Ionicons name="leaf-outline" size={20} color="#2E7D32" />
          <Text style={styles.infoText}>Powders for remedies</Text>
        </View>

        <Text style={styles.infoHeading}>Other Info:</Text>
        <View style={styles.point}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#2E7D32"
          />
          <Text style={styles.infoText}>Considered spiritually purifying</Text>
        </View>
        <View style={styles.point}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#2E7D32"
          />
          <Text style={styles.infoText}>
            Commonly grown in Indian households
          </Text>
        </View>
      </Animatable.View>

      {/* Back Button */}
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

export default Tulsi;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FFF4" },
  plantImage: {
    width: width * 0.8,
    height: width * 0.5,
    marginTop: 20,
    borderRadius: 12,
  },
  plantName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2E7D32",
    marginTop: 20,
    textAlign: "center",
  },
  infoBox: {
    backgroundColor: "#C8E6C9",
    width: "90%",
    borderRadius: 15,
    padding: 15,
    marginTop: 20,
  },
  infoHeading: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2E7D32",
    marginTop: 10,
  },
  point: { flexDirection: "row", alignItems: "center", marginVertical: 4 },
  infoText: {
    fontSize: 16,
    color: "#2E7D32",
    marginLeft: 8,
    textAlign: "left",
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#388E3C",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 30,
  },
  backButtonText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
});
