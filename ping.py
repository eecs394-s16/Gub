# this script will periodically ping phones to ask them to get the current location
import json
import requests

headers = {
    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJhYzRjYTRlZS1lODQ0LTRiYTUtYmUyYy04NDhhNjY5MjlmZTkifQ.eaAP2rk8vcDWVAJunzTCRV_0f9ue27YsaWvxj5Lwscc',
    'Content-Type': 'application/json',
}

data = {
    "tokens": ["DEV-9ca74a3a-7836-43e0-b820-ecc46eeba916"],
    "profile": "gub_dev",
    "notification": {
        "title": "Hi!",
        "message": "You have received a match!"
    }
}

