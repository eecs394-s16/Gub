# Gub
1. Clone the repo to your computer
2. `ionic platform add ios`
3. `ionic platform add android`
4. Install `cordova-plugin-inappbrowser` and `cordova-plugin-whitelist` as per [this](https://www.firebase.com/docs/web/libraries/ionic/guide.html#section-cordova-inappbrowser). This allows Facebook login to work on mobile devices and not only in the browser.
  * The specific command is `cordova plugin add <plugin-name>`.
5. For push notifications, install the necessary platforms as per [this](http://docs.ionic.io/v2.0.0-beta/docs/push-full-setup):
  * `ionic add ionic-platform-web-client`
  * `ionic plugin add phonegap-plugin-push --variable SENDER_ID="GCM_PROJECT_NUMBER"`
6. Follow Ionic build instructions for iOS and Android
