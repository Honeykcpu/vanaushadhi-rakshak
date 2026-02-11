// API Service for Vanaushadhi Rakshak
// Handles communication between React Native app and Flask backend

import axios from 'axios';

// IMPORTANT: Update this with your computer's IP address
// Find your IP: Windows (ipconfig), Mac/Linux (ifconfig)
const API_BASE_URL = 'http://192.168.29.25:5000/api';;  // Change this IP!

class VanaushadhiAPI {
  
  /**
   * Test if API server is online
   */
  static async healthCheck() {
    try {
      const response = await axios.get(API_BASE_URL.replace('/api', ''));
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error('Cannot connect to server. Make sure Flask API is running.');
    }
  }

  /**
   * Upload image and get plant diagnosis
   * @param {string} imageUri - Local URI of the captured/selected image
   * @returns {Promise<Object>} Diagnosis report
   */
  static async diagnose(imageUri) {
    try {
      // Convert image to base64
      const base64Image = await this.convertImageToBase64(imageUri);
      
      const response = await axios.post(
        `${API_BASE_URL}/diagnose`,
        {
          image_base64: base64Image
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 30000  // 30 second timeout
        }
      );
      
      if (response.data.success) {
        return response.data.report;
      } else {
        throw new Error(response.data.error || 'Diagnosis failed');
      }
    } catch (error) {
      console.error('Diagnosis error:', error);
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Server not responding. Please start the Flask API.');
      } else if (error.code === 'ETIMEDOUT') {
        throw new Error('Request timeout. Please try again.');
      } else {
        throw new Error(error.message || 'Failed to diagnose plant');
      }
    }
  }

  /**
   * Get list of all plants in database
   */
  static async getAllPlants() {
    try {
      const response = await axios.get(`${API_BASE_URL}/plants`);
      
      if (response.data.success) {
        return response.data.plants;
      } else {
        throw new Error('Failed to fetch plants');
      }
    } catch (error) {
      console.error('Get plants error:', error);
      throw error;
    }
  }

  /**
   * Get detailed information about a specific plant
   * @param {string} plantName - Scientific or common name
   */
  static async getPlantInfo(plantName) {
    try {
      const response = await axios.get(`${API_BASE_URL}/plant/${encodeURIComponent(plantName)}`);
      
      if (response.data.success) {
        return response.data.plant;
      } else {
        throw new Error('Plant not found');
      }
    } catch (error) {
      console.error('Get plant info error:', error);
      throw error;
    }
  }

  /**
   * Helper: Convert local image URI to base64
   * @param {string} uri - Image URI from camera/gallery
   */
  static async convertImageToBase64(uri) {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          // Remove the data URL prefix (e.g., "data:image/jpeg;base64,")
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Image conversion error:', error);
      throw new Error('Failed to process image');
    }
  }
}

export default VanaushadhiAPI;