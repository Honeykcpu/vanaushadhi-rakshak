// File: ClimateData.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";

const API_KEY = "41a2a699e0f547c49a8121521250410"; // Replace with your API key

const cities = [
  { label: "Select City", value: "" },
  { label: "Delhi, India", value: "Delhi" },
  { label: "Mumbai, India", value: "Mumbai" },
  { label: "Thane, India", value: "Thane" },
  { label: "Bengaluru, India", value: "Bengaluru" },
];

const ClimateData = ({ navigation }) => {
  const [selectedCity, setSelectedCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);

  const fetchWeather = async (city) => {
    try {
      const res = await axios.get(
        `http://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${city}`
      );
      setWeatherData(res.data);
    } catch (err) {
      console.log(err);
      setWeatherData(null);
      alert("City not found or API error");
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        alignItems: "center",
        paddingBottom: 30,
        paddingTop: 20,
      }}
    >
      {/* Heading */}
      <Text style={styles.heading}>🌦 Climate Data</Text>

      {/* City Picker */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={selectedCity}
          onValueChange={(itemValue) => {
            setSelectedCity(itemValue);
            if (itemValue) fetchWeather(itemValue);
          }}
          style={styles.pickerStyle}
          itemStyle={styles.pickerItemStyle}
        >
          {cities.map((city) => (
            <Picker.Item
              key={city.value}
              label={city.label}
              value={city.value}
            />
          ))}
        </Picker>
      </View>

      {/* Weather Info */}
      {weatherData && (
        <View style={styles.weatherContainer}>
          <Text style={styles.cityName}>{weatherData.location.name}</Text>
          <Image
            source={{ uri: `https:${weatherData.current.condition.icon}` }}
            style={styles.weatherIcon}
          />
          <Text style={styles.weatherText}>
            {weatherData.current.condition.text}
          </Text>
          <Text style={styles.weatherText}>
            🌡 Temperature: {weatherData.current.temp_c}°C
          </Text>
          <Text style={styles.weatherText}>
            💧 Humidity: {weatherData.current.humidity}%
          </Text>
          <Text style={styles.weatherText}>
            💨 Wind: {weatherData.current.wind_kph} kph
          </Text>
        </View>
      )}

      {/* Back Button at the bottom */}
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

export default ClimateData;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F0FFF4" },
  heading: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 20,
    textAlign: "center",
  },
  pickerContainer: {
    width: "90%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 20,
  },
  pickerStyle: { height: 60, color: "#2E7D32", width: "100%" },
  pickerItemStyle: { fontSize: 16, height: 50, color: "#2E7D32" },
  weatherContainer: {
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    padding: 20,
    borderRadius: 12,
    width: "90%",
    marginBottom: 30,
  },
  cityName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 10,
  },
  weatherIcon: { width: 80, height: 80, marginBottom: 10 },
  weatherText: { fontSize: 16, marginBottom: 5, color: "#2E7D32" },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#388E3C",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
});
