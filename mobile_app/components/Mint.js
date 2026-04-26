import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const Mint = ({ navigation }) => {
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        alignItems: "center",
        paddingBottom: 30,
        paddingTop: 20,
      }}
    >
      <Animatable.Image
        animation="fadeInDown"
        duration={1500}
        source={require("../assets/Mint.png")}
        style={styles.plantImage}
        resizeMode="contain"
      />
      <Animatable.Text
        animation="fadeInUp"
        delay={500}
        style={styles.plantName}
      >
        Mint
      </Animatable.Text>

      <Animatable.View animation="fadeInUp" delay={700} style={styles.infoBox}>
        <Text style={styles.infoHeading}>Health Benefits:</Text>
        <View style={styles.point}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#2E7D32" />
          <Text style={styles.infoText}>Aids digestion</Text>
        </View>
        <View style={styles.point}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#2E7D32" />
          <Text style={styles.infoText}>Cooling effect on body</Text>
        </View>
        <View style={styles.point}>
          <Ionicons name="checkmark-circle-outline" size={20} color="#2E7D32" />
          <Text style={styles.infoText}>Relieves nausea</Text>
        </View>

        <Text style={styles.infoHeading}>Uses:</Text>
        <View style={styles.point}>
          <Ionicons name="leaf-outline" size={20} color="#2E7D32" />
          <Text style={styles.infoText}>Teas and culinary</Text>
        </View>
        <View style={styles.point}>
          <Ionicons name="leaf-outline" size={20} color="#2E7D32" />
          <Text style={styles.infoText}>Essential oils</Text>
        </View>

        <Text style={styles.infoHeading}>Other Info:</Text>
        <View style={styles.point}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#2E7D32"
          />
          <Text style={styles.infoText}>Spreads easily in gardens</Text>
        </View>
        <View style={styles.point}>
          <Ionicons
            name="information-circle-outline"
            size={20}
            color="#2E7D32"
          />
          <Text style={styles.infoText}>Grows fast in temperate climates</Text>
        </View>
      </Animatable.View>

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

export default Mint;

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
