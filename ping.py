# this script will periodically ping phones to ask them to get the current location
import json
import requests

headers = {
    'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJhYzRjYTRlZS1lODQ0LTRiYTUtYmUyYy04NDhhNjY5MjlmZTkifQ.eaAP2rk8vcDWVAJunzTCRV_0f9ue27YsaWvxj5Lwscc',
    'Content-Type': 'application/json',
}

data = {
    "tokens": ["DEV-aa3d8c6a-4afc-434f-bb17-6c191017581e"],
    "profile": "gub_dev",
    "notification": {
        "title": "Hi!",
        "message": "You have received a match!"
    }
}

r = requests.post('https://api.ionic.io/push/notifications', headers=headers, data=json.dumps(data))
print r
