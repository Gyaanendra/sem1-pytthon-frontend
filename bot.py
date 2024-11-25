import time
import requests

# API URL you want to keep warm
API_URL = "https://your-api-url.com/endpoint"

# Frequency of requests in seconds (e.g., 5 minutes)
REQUEST_INTERVAL = 5 * 60  # 5 minutes

def send_warm_request():
    try:
        response = requests.get(API_URL)
        if response.status_code == 200:
            print("API is warm and responding.")
        else:
            print(f"Received unexpected status code: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Error sending request: {e}")

def start_warming():
    while True:
        send_warm_request()
        time.sleep(REQUEST_INTERVAL)

if __name__ == "__main__":
    start_warming()
