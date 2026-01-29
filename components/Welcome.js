import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from "react-native";
import * as Animatable from "react-native-animatable";
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get("window");

const Welcome = ({ navigation }) => {
  return (
    <View style={styles.container}>
      {/* Animated Logo */}
      <Animatable.Image
        animation="bounceIn"
        duration={2000}
        source={require("../assets/logo.jpg")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Welcome Text */}
      <Animatable.View animation="fadeInUp" delay={1000} style={styles.textContainer}>
        <Text style={styles.title}>Welcome to Vanaushadhi Rakshak</Text>
        <Text style={styles.subtitle}>
          Discover medicinal plants and protect them easily.
        </Text>
      </Animatable.View>

      {/* Get Started Button */}
      <Animatable.View animation="zoomIn" delay={1500}>
        <TouchableOpacity
          style={styles.startButton}
          onPress={() => navigation.replace("Home")}
        >
          <Text style={styles.startButtonText}> Get Started </Text>
          <Ionicons name="chevron-forward" size={20} color="#fff" />
        </TouchableOpacity>
      </Animatable.View>
    </View>
  );
};

export default Welcome;

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    alignItems: "center", 
    justifyContent: "center", 
    backgroundColor: "#F0FFF4", 
    paddingHorizontal: 20 
  },
  logo: { 
    width: width * 0.6, 
    height: width * 0.6, 
    marginBottom: 30, 
    borderRadius: 20 
  },
  textContainer: { 
    alignItems: "center", 
    marginBottom: 40 
  },
  title: { 
    fontSize: 28, 
    fontWeight: "bold", 
    color: "#2E7D32", 
    textAlign: "center" 
  },
  subtitle: { 
    fontSize: 16, 
    color: "#388E3C", 
    textAlign: "center", 
    marginTop: 8 
  },
  startButton: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#2E7D32", 
    paddingVertical: 12, 
    paddingHorizontal: 25, 
    borderRadius: 12 
  },
  startButtonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "bold", 
    marginRight: 8 
  },
});
