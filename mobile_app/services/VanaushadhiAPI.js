const API_BASE_URL = "http://192.168.29.25:5000"; // YOUR PC IP HERE

export const diagnoseImage = async (imageUri) => {
  const formData = new FormData();
  formData.append("image", {
    uri: imageUri,
    type: "image/jpeg",
    name: "leaf.jpg",
  });

  console.log("API URL:", `${API_BASE_URL}/api/diagnose`);

  const response = await fetch(`${API_BASE_URL}/api/diagnose`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  return await response.json();
};
