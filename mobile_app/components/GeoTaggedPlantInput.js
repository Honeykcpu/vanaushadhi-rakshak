import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import Toast from "react-native-toast-message";

const { width } = Dimensions.get("window");

const GeoTaggedPlantInput = ({ navigation }) => { // receive navigation prop
  const [newPlantName, setNewPlantName] = useState("");
  const [newPlantPhoto, setNewPlantPhoto] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [addedPlant, setAddedPlant] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  // Fetch user location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  // Pick image
  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) setNewPlantPhoto(result.assets[0].uri);
  };

  // Add plant
  const addPlant = () => {
    if (!newPlantName || !newPlantPhoto) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Please enter name and select photo!",
      });
      return;
    }

    if (!userLocation) {
      Toast.show({
        type: "error",
        text1: "Error",
        text2: "Location not available yet!",
      });
      return;
    }

    const plantData = {
      name: newPlantName,
      photo: newPlantPhoto,
      latitude: userLocation.latitude,
      longitude: userLocation.longitude,
    };

    setAddedPlant(plantData);
    setShowDetails(true);

    // Reset inputs
    setNewPlantName("");
    setNewPlantPhoto(null);

    Toast.show({
      type: "success",
      text1: "Plant Added",
      text2: `${plantData.name} added successfully!`,
      visibilityTime: 2000,
    });

    // Hide details after 3 sec
    setTimeout(() => {
      setShowDetails(false);
      setAddedPlant(null);
    }, 3000);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>🌿 Add New Plant</Text>

      <TextInput
        placeholder="Plant Name"
        style={styles.input}
        value={newPlantName}
        onChangeText={setNewPlantName}
      />

      <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
        <Text style={styles.photoButtonText}>
          {newPlantPhoto ? "Change Photo" : "Select Plant Photo"}
        </Text>
      </TouchableOpacity>

      {newPlantPhoto && (
        <Image source={{ uri: newPlantPhoto }} style={styles.previewImage} />
      )}

      <TouchableOpacity style={styles.addButton} onPress={addPlant}>
        <Text style={styles.addButtonText}>Add Plant</Text>
      </TouchableOpacity>

      {/* Plant Details */}
      {showDetails && addedPlant && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailText}>🌱 Name: {addedPlant.name}</Text>
          <Text style={styles.detailText}>
            📍 Latitude: {addedPlant.latitude.toFixed(5)}
          </Text>
          <Text style={styles.detailText}>
            📍 Longitude: {addedPlant.longitude.toFixed(5)}
          </Text>
          {addedPlant.photo && (
            <Image
              source={{ uri: addedPlant.photo }}
              style={styles.previewImage}
            />
          )}
        </View>
      )}

      {/* Go Back Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backButtonText}>⬅ Go Back</Text>
      </TouchableOpacity>

      <Toast />
    </View>
  );
};

export default GeoTaggedPlantInput;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F0FFF4",
    alignItems: "center",
    paddingTop: 50,
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2E7D32",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    width: width * 0.9,
    marginBottom: 15,
  },
  photoButton: {
    backgroundColor: "#388E3C",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    width: width * 0.9,
    alignItems: "center",
  },
  photoButtonText: { color: "#fff", fontWeight: "bold" },
  addButton: {
    backgroundColor: "#388E3C",
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    width: width * 0.9,
    alignItems: "center",
  },
  addButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  previewImage: { width: 150, height: 150, borderRadius: 8, marginTop: 10 },
  detailsContainer: {
    marginTop: 20,
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    padding: 15,
    borderRadius: 12,
  },
  detailText: { fontSize: 16, marginBottom: 5, color: "#2E7D32" },
  backButton: {
    marginTop: 30,
    backgroundColor: "#388E3C",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  backButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
