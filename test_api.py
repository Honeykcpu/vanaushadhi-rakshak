"""
Quick Test Script for Vanaushadhi Rakshak API
Tests the API without needing the mobile app
"""

import requests
import base64
from PIL import Image
import io
import json

API_URL = "http://localhost:5000"

def test_health_check():
    """Test if API is running"""
    print("\n" + "="*60)
    print("TEST 1: Health Check")
    print("="*60)
    
    try:
        response = requests.get(f"{API_URL}/")
        data = response.json()
        
        print("API is online!")
        print(f"   Status: {data['status']}")
        print(f"   Version: {data['version']}")
        print(f"   Mode: {data['mode']}")
        print(f"   Database: {data['database_size']} plants")
        print(f"   Test plants: {', '.join(data['test_plants'])}")
        return True
    except Exception as e:
        print(f"Failed: {e}")
        return False


def test_get_plants():
    """Test getting all plants"""
    print("TEST 2: Get All Plants")
    
    try:
        response = requests.get(f"{API_URL}/api/plants")
        data = response.json()
        
        print(f"Retrieved {data['count']} plants")
        print("\nFirst 5 plants:")
        for plant in data['plants'][:5]:
            print(f"   - {plant['common_name']} ({plant['scientific_name']})")
            print(f"     Diseases: {', '.join(plant['diseases'])}")
        return True
    except Exception as e:
        print(f"Failed: {e}")
        return False


def test_diagnose_with_test_image():
    """Test diagnosis with a sample image"""
    print("TEST 3: Diagnose Plant (Mock Image)")
    
    try:
        # Create a test image (green leaf simulation)
        img = Image.new('RGB', (500, 500), color=(34, 139, 34))  # Green color
        
        # Add some brown spots (simulate disease)
        import numpy as np
        img_array = np.array(img)
        # Add brown patches
        img_array[100:150, 100:150] = [139, 69, 19]  # Brown spots
        img_array[300:350, 300:350] = [139, 69, 19]
        img = Image.fromarray(img_array.astype('uint8'))
        
        # Convert to base64
        buffered = io.BytesIO()
        img.save(buffered, format="JPEG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        # Send to API
        response = requests.post(
            f"{API_URL}/api/diagnose",
            json={"image_base64": img_base64},
            timeout=30
        )
        
        data = response.json()
        
        if data['success']:
            report = data['report']
            print(" Diagnosis successful!\n")
            print(f"   Species: {report['species']}")
            print(f"   Common Name: {report['common_name']}")
            print(f"   Condition: {report['condition']}")
            print(f"   Confidence: {report['confidence']}")
            print(f"   Detected Symptoms: {', '.join(report['detected_symptoms'])}")
            print(f"\n   Treatment: {report['treatment']}")
            return True
        else:
            print(f"Failed Diagnosis: {data.get('error')}")
            return False
            
    except Exception as e:
        print(f"Failed: {e}")
        return False


def run_all_tests():
    """Run all tests"""
    print("\n" + "🌿"*30)
    print("VANAUSHADHI RAKSHAK - API TEST SUITE")
    print("🌿"*30)
    
    results = []
    
    # Test 1: Health Check
    results.append(("Health Check", test_health_check()))
    
    # Test 2: Get Plants
    results.append(("Get Plants", test_get_plants()))
    
    # Test 3: Diagnose
    results.append(("Diagnose", test_diagnose_with_test_image()))
    
    # Summary
    print("TEST SUMMARY")
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = " PASS" if result else " FAIL"
        print(f"{status} - {test_name}")
    
    print(f"\nTotal: {passed}/{total} tests passed")
    
    if passed == total:
        print("\n All tests passed! API is working correctly!")
        print("\n You can now test with the mobile app:")
        print("   1. Update IP in VanaushadhiAPI.js")
        print("   2. Run: npm start")
        print("   3. Open Expo Go and scan QR code")
    else:
        print("\n Some tests failed. Check the errors above.")


if __name__ == "__main__":
    # Import numpy only when needed
    import numpy as np
    
    print("\n Waiting for API server...")
    print("   (Make sure flask_api_test.py is running)")
    input("\nPress Enter when API server is ready...")
    
    run_all_tests()
