# this script will periodically ping phones to ask them to get the current location
import json
import requests

headers = {
    'Authorization': 'key=AIzaSyBMUXhP_jdUVOOC8Rsdc6BG6lfSZwc4jUs',
    'Content-Type': 'application/json',
}

data = {
    "registration_ids": ["APA91bFmjDxamCSDZ-mwauTHo0BIGNrqr6Fo2oCH3sii8Nizu3P6JFqG-2Ti6xixrcWvWNzlhMZH9PgwLTOMBh82g9zEPsZBPanWX6U_s2txrRIqSsiAFRPyH-yH1rEJMkR-SYFn_Lic"]
}

r = requests.post('https://gcm-http.googleapis.com/gcm/send', headers=headers, data=json.dumps(data))
print r
