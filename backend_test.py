#!/usr/bin/env python3
"""
ScaleMate Backend API Testing
Tests the backend endpoints for proper error handling when API keys are missing.
"""

import requests
import json
import tempfile
import os
from pathlib import Path

# Backend URL from frontend .env
BACKEND_URL = "https://chord-transpose-3.preview.emergentagent.com/api"

def test_process_endpoint_missing_groq_key():
    """Test POST /api/process returns clear error when GROQ_API_KEY is missing"""
    print("🧪 Testing POST /api/process with missing GROQ_API_KEY...")
    
    payload = {
        "song_name": "Blinding Lights",
        "instrument": "Guitar"
    }
    
    try:
        response = requests.post(f"{BACKEND_URL}/process", json=payload, timeout=30)
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 500:
            response_data = response.json()
            if "GROQ_API_KEY is not configured" in response_data.get("detail", ""):
                print("   ✅ PASS: Correct error message for missing GROQ_API_KEY")
                return True
            else:
                print(f"   ❌ FAIL: Unexpected error message: {response_data.get('detail')}")
                return False
        else:
            print(f"   ❌ FAIL: Expected status 500, got {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ FAIL: Request failed: {e}")
        return False

def create_dummy_wav_file():
    """Create a small dummy WAV file for testing"""
    # Minimal WAV file header (44 bytes) + minimal audio data
    wav_header = b'RIFF$\x00\x00\x00WAVEfmt \x10\x00\x00\x00\x01\x00\x01\x00D\xac\x00\x00\x88X\x01\x00\x02\x00\x10\x00data\x00\x00\x00\x00'
    
    temp_file = tempfile.NamedTemporaryFile(delete=False, suffix='.wav')
    temp_file.write(wav_header)
    temp_file.close()
    return temp_file.name

def test_analyze_audio_endpoint_missing_google_key():
    """Test POST /api/analyze-audio returns clear error when GOOGLE_API_KEY is missing"""
    print("🧪 Testing POST /api/analyze-audio with missing GOOGLE_API_KEY...")
    
    # Create a small dummy WAV file
    wav_file_path = create_dummy_wav_file()
    
    try:
        with open(wav_file_path, 'rb') as f:
            files = {'file': ('test.wav', f, 'audio/wav')}
            response = requests.post(f"{BACKEND_URL}/analyze-audio", files=files, timeout=30)
            
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 500:
            response_data = response.json()
            if "GOOGLE_API_KEY is not configured" in response_data.get("detail", ""):
                print("   ✅ PASS: Correct error message for missing GOOGLE_API_KEY")
                return True
            else:
                print(f"   ❌ FAIL: Unexpected error message: {response_data.get('detail')}")
                return False
        else:
            print(f"   ❌ FAIL: Expected status 500, got {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ FAIL: Request failed: {e}")
        return False
    finally:
        # Clean up temp file
        try:
            os.unlink(wav_file_path)
        except:
            pass

def test_backend_health():
    """Test basic backend connectivity"""
    print("🧪 Testing backend health check...")
    
    try:
        response = requests.get(f"{BACKEND_URL}/", timeout=10)
        print(f"   Status Code: {response.status_code}")
        print(f"   Response: {response.text}")
        
        if response.status_code == 200:
            response_data = response.json()
            if "ScaleMate backend is running" in response_data.get("message", ""):
                print("   ✅ PASS: Backend is running")
                return True
            else:
                print(f"   ❌ FAIL: Unexpected response: {response_data}")
                return False
        else:
            print(f"   ❌ FAIL: Expected status 200, got {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"   ❌ FAIL: Request failed: {e}")
        return False

def main():
    """Run all backend tests"""
    print("=" * 60)
    print("ScaleMate Backend API Testing")
    print("=" * 60)
    print(f"Backend URL: {BACKEND_URL}")
    print()
    
    results = []
    
    # Test 1: Backend health check
    results.append(test_backend_health())
    print()
    
    # Test 2: Process endpoint with missing GROQ_API_KEY
    results.append(test_process_endpoint_missing_groq_key())
    print()
    
    # Test 3: Analyze audio endpoint with missing GOOGLE_API_KEY
    results.append(test_analyze_audio_endpoint_missing_google_key())
    print()
    
    # Summary
    print("=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    passed = sum(results)
    total = len(results)
    
    print(f"Tests Passed: {passed}/{total}")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED!")
        return True
    else:
        print("❌ SOME TESTS FAILED!")
        return False

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)