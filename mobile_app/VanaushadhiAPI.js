// VanaushadhiAPI.js
// Place in: mobile_app/services/VanaushadhiAPI.js

const API_BASE_URL = "http://192.168.29.25:5000"; // CHANGE THIS TO YOUR PC IP

export const diagnoseImage = async (imageUri) => {
  try {
    console.log("=== API CALL START ===");
    console.log("Image URI:", imageUri);
    console.log("API URL:", `${API_BASE_URL}/api/diagnose`);

    const formData = new FormData();
    formData.append("image", {
      uri: imageUri,
      type: "image/jpeg",
      name: "leaf.jpg",
    });

    console.log("Sending request...");

    const response = await fetch(`${API_BASE_URL}/api/diagnose`, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    console.log("Response status:", response.status);
    console.log("Response ok:", response.ok);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error response:", errorText);
      throw new Error(`Server returned ${response.status}: ${errorText}`);
    }

    const json = await response.json();
    console.log("=== SUCCESS ===");
    console.log("Response data:", JSON.stringify(json, null, 2));

    return json;
  } catch (error) {
    console.error("=== API ERROR ===");
    console.error("Error type:", error.name);
    console.error("Error message:", error.message);
    console.error("Full error:", error);

    if (error.message.includes("Network request failed")) {
      throw new Error(
        "Cannot connect to server. Make sure Flask is running and IP is correct.",
      );
    }

    throw error;
  }
};

export const checkServerStatus = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    const data = await response.json();
    console.log("Server status:", data);
    return data;
  } catch (error) {
    console.error("Server not reachable:", error.message);
    return null;
  }
};
