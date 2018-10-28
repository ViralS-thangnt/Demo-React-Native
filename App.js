/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import { StyleSheet, Platform } from 'react-native';
import { Container, Button, Text, Header, Content, ActionSheet } from 'native-base';

import FCM, { NotificationActionType } from "react-native-fcm";
import { registerKilledListener, registerAppListener } from "./Libs/Firebase/Listeners";
import firebaseClient from "./Libs/Firebase/FirebaseClient";

// const instructions = Platform.select({
//   ios: 'Press Cmd+R to reload,\n' + 'Cmd+D or shake for dev menu.',
//   android:
//     'Double tap R on your keyboard to reload,\n' +
//     'Shake or press menu button for dev menuTHANG1111',
// });

registerKilledListener();

var BUTTONS = [
  { text: "Option 0", icon: "american-football", iconColor: "#2c8ef4" },
  { text: "Option 1", icon: "analytics", iconColor: "#f42ced" },
  { text: "Option 2", icon: "aperture", iconColor: "#ea943b" },
  { text: "Delete", icon: "trash", iconColor: "#fa213b" },
  { text: "Cancel", icon: "close", iconColor: "#25de5b" }
];
var DESTRUCTIVE_INDEX = 3;
var CANCEL_INDEX = 4;

type Props = {};
export default class App extends Component<Props> {

    constructor(props) {
        super(props);

        this.state = {
            token: "",
            tokenCopyFeedback: ""
        };
    }

    async componentDidMount() {
        //FCM.createNotificationChannel is mandatory for Android targeting >=8. Otherwise you won't see any notification
        FCM.createNotificationChannel({
            id: 'default',
            name: 'Default',
            description: 'used for example',
            priority: 'high'
        })
        registerAppListener(this.props.navigation);
        FCM.getInitialNotification().then(notif => {
            this.setState({
                initNotif: notif
            });
            if (notif && notif.targetScreen === "detail") {
                setTimeout(() => {
                    this.props.navigation.navigate("Detail");
                }, 500);
            }
        });

        try {
            let result = await FCM.requestPermissions({
                badge: false,
                sound: true,
                alert: true
            });
        } catch (e) {
            console.error(e);
        }

        FCM.getFCMToken().then(token => {
            console.log("TOKEN (getFCMToken)", token);
            this.setState({ token: token || "" });
        });

        if (Platform.OS === "ios") {
            FCM.getAPNSToken().then(token => {
                console.log("APNS TOKEN (getFCMToken)", token);
            });
        }

        // topic example
        // FCM.subscribeToTopic('sometopic')
        // FCM.unsubscribeFromTopic('sometopic')

    }

    showLocalNotification() {
        FCM.presentLocalNotification({
            channel: 'default',
            id: new Date().valueOf().toString(), // (optional for instant notification)
            title: "Test Notification with action", // as FCM payload
            body: "Force touch to reply", // as FCM payload (required)
            sound: "bell.mp3", // "default" or filename
            priority: "high", // as FCM payload
            click_action: "com.myapp.MyCategory", // as FCM payload - this is used as category identifier on iOS.
            badge: 10, // as FCM payload IOS only, set 0 to clear badges
            number: 10, // Android only
            ticker: "My Notification Ticker", // Android only
            auto_cancel: true, // Android only (default true)
            large_icon:
                "https://image.freepik.com/free-icon/small-boy-cartoon_318-38077.jpg", // Android only
            icon: "ic_launcher", // as FCM payload, you can relace this with custom icon you put in mipmap
            big_text: "Show when notification is expanded", // Android only
            sub_text: "This is a subText", // Android only
            color: "red", // Android only
            vibrate: 300, // Android only default: 300, no vibration if you pass 0
            wake_screen: true, // Android only, wake up screen when notification arrives
            group: "group", // Android only
            picture:
                "https://www.google.com/images/branding/googlelogo/2x/googlelogo_color_150x54dp.png", // Android only bigPicture style
            ongoing: true, // Android only
            my_custom_data: "my_custom_field_value", // extra data you want to throw
            lights: true, // Android only, LED blinking (default false)
            show_in_foreground: true // notification when app is in foreground (local & remote)
        });
    }

    scheduleLocalNotification() {
        FCM.scheduleLocalNotification({
            id: "testnotif",
            fire_date: new Date().getTime() + 5000,
            vibrate: 500,
            title: "Hello",
            body: "Test Scheduled Notification",
            sub_text: "sub text",
            priority: "high",
            large_icon:
                "https://image.freepik.com/free-icon/small-boy-cartoon_318-38077.jpg",
            show_in_foreground: true,
            picture:
                "https://firebase.google.com/_static/af7ae4b3fc/images/firebase/lockup.png",
            wake_screen: true,
            extra1: { a: 1 },
            extra2: 1
        });
    }

    sendRemoteNotification(token) {
        let body;

        if (Platform.OS === "android") {
            body = {
                to: token,
                data: {
                    custom_notification: {
                        title: "Simple FCM Client",
                        body: "Click me to go to detail",
                        sound: "default",
                        priority: "high",
                        show_in_foreground: true,
                        targetScreen: "detail"
                    }
                },
                priority: 10
            };
        } else {
            body = {
                to: token,
                notification: {
                    title: "Simple FCM Client",
                    body: "Click me to go to detail",
                    sound: "default"
                },
                data: {
                    targetScreen: "detail"
                },
                priority: 10
            };
        }

        firebaseClient.send(JSON.stringify(body), "notification");
    }

    sendRemoteData(token) {
        let body = {
            to: token,
            data: {
                title: "Simple FCM Client",
                body: "This is a notification with only DATA.",
                sound: "default"
            },
            priority: "normal"
        };

        firebaseClient.send(JSON.stringify(body), "data");
    }

    showLocalNotificationWithAction() {
        FCM.presentLocalNotification({
            title: "Test Notification with action",
            body: "Force touch to reply",
            priority: "high",
            show_in_foreground: true,
            click_action: "com.myidentifi.fcm.text", // for ios
            android_actions: JSON.stringify([
                {
                    id: "view",
                    title: "view"
                },
                {
                    id: "dismiss",
                    title: "dismiss"
                }
            ]) // for android, take syntax similar to ios's. only buttons are supported
        });
    }

  render() {

    let { token, tokenCopyFeedback } = this.state;

    return (
      <Container>
        <Header />

        <Content padder>
          <Button>
            <Text style={styles.button}>
              Thang
            </Text>
          </Button>

          <Button
            onPress={
              () =>  ActionSheet.show(
                  {
                    options: BUTTONS,
                    cancelButtonIndex: CANCEL_INDEX,
                    destructiveButtonIndex: DESTRUCTIVE_INDEX,
                    title: "Testing ActionSheet"
                  },
                  buttonIndex => {
                    // this.setState({ clicked: BUTTONS[buttonIndex] });
                    
                  },
                )
            }
          >
            <Text>
              Action Sheet
            </Text>

          </Button>

        </Content>

      </Container>
      // <View style={styles.container}>
      //   <Text style={styles.welcome}>Welcome to React Native!</Text>
      //   <Text style={styles.instructions}>To get started, edit App.js</Text>
      //   <Text style={styles.instructions}>{instructions}</Text>
      // </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
  button: {
    color: '#495',
  },
});
