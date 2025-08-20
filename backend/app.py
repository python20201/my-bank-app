# backend/app.py

import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from dotenv import load_dotenv

# Load the environment variables from the .env file
load_dotenv()

app = Flask(__name__)
# Allow requests from your React frontend
CORS(app)

# Get credentials from the environment variables you set in .env
ALLOY_TOKEN = os.getenv('ALLOY_WORKFLOW_TOKEN')
ALLOY_SECRET = os.getenv('ALLOY_WORKFLOW_SECRET')
ALLOY_EVALUATION_URL = 'https://sandbox.alloy.co/v1/evaluations'

# This is the API route your React app will send data to
@app.route('/evaluate', methods=['POST'])
def evaluate_applicant():
    # 1. Get the form data sent by React
    applicant_data = request.get_json()

    # 2. Structure the data exactly as the Alloy API expects it
    # The PDF instructions say to format fields like 'name_first', 'address_line_1', etc.
    payload = {
        "name_first": applicant_data.get('firstName'),
        "name_last": applicant_data.get('lastName'),
        "address_line_1": applicant_data.get('addressLine1'),
        "address_line_2": applicant_data.get('addressLine2'),
        "address_city": applicant_data.get('city'),
        "address_state": applicant_data.get('state'),
        "address_postal_code": applicant_data.get('zipCode'),
        "address_country_code": applicant_data.get('country'),
        "birth_date": applicant_data.get('dob'),
        "document_ssn": applicant_data.get('ssn'),
        "email_address": applicant_data.get('email')
    }

    try:
        # 3. Make the POST request to the Alloy API
        # We use Basic Auth with the token as the username and the secret as the password
        response = requests.post(
            ALLOY_EVALUATION_URL,
            json=payload,
            auth=(ALLOY_TOKEN, ALLOY_SECRET)
        )

        # Raise an error if the request was not successful (e.g., 400 or 500 error)
        response.raise_for_status()

        # 4. Get the JSON response from Alloy
        alloy_response_data = response.json()

        # 5. Extract the outcome and send it back to the React frontend
        outcome = alloy_response_data.get("summary", {}).get("outcome")
        return jsonify({'outcome': outcome})

    except requests.exceptions.RequestException as e:
        # Handle API errors gracefully
        print(f"An error occurred: {e}")
        # Also return the error response from Alloy if available
        if e.response is not None:
            return jsonify(e.response.json()), e.response.status_code
        return jsonify({'error': 'Failed to connect to Alloy API'}), 500

# This is needed to run the app with the `flask run` command
if __name__ == '__main__':
    app.run(debug=True)
