# this script will periodically ping phones to ask them to get the current location
import json
import requests

headers = {
    'Authorization': 'key=AIzaSyBMUXhP_jdUVOOC8Rsdc6BG6lfSZwc4jUs',
    'Content-Type': 'application/json',
}

data = {
    "registration_ids": ["APA91bFmjDxamCSDZ-mwauTHo0BIGNrqr6Fo2oCH3sii8Nizu3P6JFqG-2Ti6xixrcWvWNzlhMZH9PgwLTOMBh82g9zEPsZBPanWX6U_s2txrRIqSsiAFRPyH-yH1rEJMkR-SYFn_Lic"],
    "message": "hello",
    "notification": {
        "alert": "Test",
        "title": "New test",
        "android": {
            "payload": {
                "id": "193348",
                "text": "Text example",
                "date": "21/03/2011 16:39",
                "content-available": "1",
                "message": "hello"
            }
        }
    }
}

r = requests.post('https://gcm-http.googleapis.com/gcm/send', headers=headers, data=json.dumps(data))
print r.content

# from gcm import GCM
#
# gcm = GCM('AIzaSyBMUXhP_jdUVOOC8Rsdc6BG6lfSZwc4jUs')
# data = {'param1': 'value1', 'param2': 'value2'}
#
# # Downstream message using JSON request
# reg_ids = ['APA91bFmjDxamCSDZ-mwauTHo0BIGNrqr6Fo2oCH3sii8Nizu3P6JFqG-2Ti6xixrcWvWNzlhMZH9PgwLTOMBh82g9zEPsZBPanWX6U_s2txrRIqSsiAFRPyH-yH1rEJMkR-SYFn_Lic']
# response = gcm.json_request(registration_ids=reg_ids, data=data)
#
# # Downstream message using JSON request with extra arguments
# res = gcm.json_request(
#     registration_ids=reg_ids, data=data,
#     collapse_key='uptoyou', delay_while_idle=True, time_to_live=3600
# )
#
# # Topic Messaging
# topic = 'topic name'
# gcm.send_topic_message(topic=topic, data=data)
