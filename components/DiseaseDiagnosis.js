import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import VanaushadhiAPI from "../services/VanaushadhiAPI";

export default function DiseaseDiagnosis({ navigation }) {
  const [image, setImage] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to diagnose using real API
  const diagnoseImage = async (uri) => {
    setImage(uri);
    setResult(null);
    setLoading(true);

    try {
      // First check if API is online
      await VanaushadhiAPI.healthCheck();
      
      // Send image for diagnosis
      const report = await VanaushadhiAPI.diagnose(uri);
      
      // Format result for display
      setResult({
        plantName: report.species,
        commonName: report.common_name || report.species,
        disease: report.condition,
        confidence: report.confidence || "High",
        treatment: report.treatment,
        symptoms: report.detected_symptoms || [],
        preventive: report.preventive_measures || []
      });
      
    } catch (error) {
      Alert.alert(
        "Diagnosis Failed",
        error.message || "Could not analyze the plant. Please ensure the Flask API is running."
      );
      console.error("Diagnosis error:", error);
    } finally {
      setLoading(false);
    }
  };

  const pickFromGallery = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", "Gallery access is needed");
      return;
    }

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!res.canceled) {
      diagnoseImage(res.assets[0].uri);
    }
  };

  const captureFromCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission Required", "Camera access is needed");
      return;
    }

    const res = await ImagePicker.launchCameraAsync({
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!res.canceled) {
      diagnoseImage(res.assets[0].uri);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🌿 Plant Disease Diagnosis</Text>
      <Text style={styles.subtitle}>AI-Powered Analysis</Text>

      <View style={styles.btnRow}>
        <TouchableOpacity 
          style={styles.btn} 
          onPress={pickFromGallery}
          disabled={loading}
        >
          <Text style={styles.btnText}>📷 Gallery</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.btn} 
          onPress={captureFromCamera}
          disabled={loading}
        >
          <Text style={styles.btnText}>📸 Camera</Text>
        </TouchableOpacity>
      </View>

      {image && (
        <Image source={{ uri: image }} style={styles.imagePreview} />
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E7D32" />
          <Text style={styles.loadingText}>Analyzing plant...</Text>
          <Text style={styles.loadingSubtext}>
            Running AI detection and checking disease database
          </Text>
        </View>
      )}

      {result && !loading && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📊 Diagnosis Report</Text>

          {/* Species Information */}
          <View style={styles.section}>
            <Text style={styles.label}>Identified Species:</Text>
            <Text style={styles.value}>{result.plantName}</Text>
            {result.commonName && (
              <Text style={styles.subValue}>({result.commonName})</Text>
            )}
          </View>

          {/* Condition Status */}
          <View style={[
            styles.statusBox,
            { backgroundColor: result.disease === "Healthy" ? "#d4edda" : "#f8d7da" }
          ]}>
            <Text style={styles.label}>Condition:</Text>
            <Text style={[
              styles.statusValue,
              { color: result.disease === "Healthy" ? "#155724" : "#721c24" }
            ]}>
              {result.disease}
            </Text>
            {result.confidence && (
              <Text style={styles.confidenceText}>
                Confidence: {result.confidence}
              </Text>
            )}
          </View>

          {/* Detected Symptoms */}
          {result.symptoms && result.symptoms.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.label}>Detected Symptoms:</Text>
              {result.symptoms.map((symptom, index) => (
                <Text key={index} style={styles.listItem}>
                  • {symptom}
                </Text>
              ))}
            </View>
          )}

          {/* Treatment */}
          <View style={styles.treatmentBox}>
            <Text style={styles.treatmentTitle}>💊 Treatment:</Text>
            <Text style={styles.treatmentText}>{result.treatment}</Text>
          </View>

          {/* Preventive Measures */}
          {result.preventive && result.preventive.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.label}>Preventive Measures:</Text>
              {result.preventive.map((measure, index) => (
                <Text key={index} style={styles.listItem}>
                  {index + 1}. {measure}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Back Button */}
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.navigate("Home")}
      >
        <Text style={styles.backBtnText}>← Back to Home</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#F1F8F4",
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    textAlign: "center",
    color: "#2E7D32",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    marginBottom: 25,
  },
  btnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  btn: {
    backgroundColor: "#2E7D32",
    padding: 15,
    borderRadius: 10,
    width: "48%",
    alignItems: "center",
    elevation: 3,
  },
  btnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  imagePreview: {
    height: 250,
    width: "100%",
    borderRadius: 15,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#2E7D32",
  },
  loadingContainer: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 15,
    alignItems: "center",
    marginBottom: 20,
    elevation: 5,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  loadingSubtext: {
    marginTop: 8,
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
    marginBottom: 5,
  },
  value: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2E7D32",
    marginTop: 5,
  },
  subValue: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
    marginTop: 3,
  },
  statusBox: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: "center",
  },
  statusValue: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 5,
    marginBottom: 5,
  },
  confidenceText: {
    fontSize: 14,
    color: "#666",
    marginTop: 5,
  },
  listItem: {
    fontSize: 14,
    color: "#555",
    marginTop: 5,
    lineHeight: 20,
  },
  treatmentBox: {
    backgroundColor: "#e8f5e9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  treatmentTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1B5E20",
    marginBottom: 10,
  },
  treatmentText: {
    fontSize: 15,
    color: "#2E7D32",
    lineHeight: 22,
  },
  backBtn: {
    backgroundColor: "#388E3C",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
    marginBottom: 30,
    elevation: 3,
  },
  backBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});