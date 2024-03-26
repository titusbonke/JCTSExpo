import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, BackHandler, Alert, Text, StatusBar, Platform, ImageBackground, Animated } from 'react-native';
import { WebView } from 'react-native-webview';
import ErrorBoundary from "./ErrorBoundary";
import NetInfo from '@react-native-community/netinfo';
import * as Linking from 'expo-linking';
import { TouchableOpacity, Image } from 'react-native';
import { Updates } from 'expo';
import Constants from 'expo-constants';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [GoBack, setGoBack] = useState(true);
  const [url, setUrl] = useState('https://jcts.org/');
  // const [url, setUrl] = useState('https://beta.sathya.in/test-product-3');
  const [isConnected, setIsConnected] = useState(true);
  const GoBackRef = useRef(GoBack);
  const webViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;




  // const checkForAppUpdate = async () => {
  //   try {
  //     const { isAvailable } = await Updates.checkForUpdateAsync();
  //     if (isAvailable) {
  //       Alert.alert(
  //         'Update Available',
  //         'A new version of the app is available. Do you want to update now?',
  //         [
  //           {
  //             text: 'Cancel',
  //             style: 'cancel',
  //           },
  //           {
  //             text: 'Update',
  //             onPress: async () => {
  //               await Updates.fetchUpdateAsync();
  //               await Updates.reloadAsync();
  //             },
  //           },
  //         ],
  //       );
  //     } else {
  //       // No update available
  //     }
  //   } catch (error) {
  //     console.error('Error checking for app update:', error);
  //   }
  // };





  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    return () => {
      unsubscribe();
    };
  }, []);



  useEffect(() => {
    GoBackRef.current = GoBack;
  }, [GoBack]);

  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    return () => backHandler.remove(); // Cleanup the event listener when component unmounts
  }, []);


  const handleBackPress = () => {
    if (webViewRef.current && GoBackRef.current) {
      webViewRef.current.goBack();
    } else {
      if (Platform.OS === 'ios') {
        Alert.alert(
          'Alert',
          'Cant go back anymore.',
          [
            { text: 'OK', onPress: () => null }
          ],
          { cancelable: false }
        );
      } else {
        Alert.alert(
          'Exit App',
          'Are you sure you want to exit?',
          [
            { text: 'Cancel', onPress: () => null },
            { text: 'Exit', onPress: () => BackHandler.exitApp() },
          ],
          { cancelable: false }
        );
      }
      return true;
    }
    return true;
  };



  const onLoadProgress = ({ nativeEvent }) => {
    if (nativeEvent.progress === 1) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start();
      setTimeout(() => {
        setIsLoading(false);
      }, 800);
    } else {
      setIsLoading(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    }
  };

  const onNavigationStateChange = (navState) => {
    const url = navState.url;
    //For Going Back 
    if (navState.canGoBack) {
      setGoBack(true)
    } else {
      setGoBack(false)
    }
  };


  const onShouldStartLoadWithRequest = (event) => {
    // Get the URL from the request event
    const { url, navigationType } = event;

    console.log(url);
    // console.log(event);
    // checkForAppUpdate();

    // if (Platform.OS === 'ios') {
      if (!url.startsWith('https')) {
        // Set the new URL in state
        console.log("hit");
        Linking.openURL(url);
        webViewRef.current.stopLoading();
        return false;
      }
    // }

    fetch(url, { method: 'HEAD' })
      .then((response) => {
        const contentDisposition = response.headers.get('content-disposition');
        if (contentDisposition && contentDisposition.toLowerCase().includes('attachment')) {
          Linking.openURL(url);
          webViewRef.current.stopLoading();
          return false;
        }
      })
      .catch((error) => {
        console.error('Error checking downloadability:', error);
      });


    // Check if the URL matches your desired domain
    // if (url.startsWith('https://sathya.in/home-appliances')) {
    //   // Set the new URL in state
    //   setUrl("https://play.google.com/store/apps/details?id=com.sathyatechnosoft.sathya.one");
    //   return false;
    // }

    if (url.includes("Dashboard")) {
      const appVersion = Constants.manifest.version;
      if (!url.includes("version")) {
        if (url.includes("?")) {
          // console.log('App Version:', appVersion);    
          TempUrl = url + "&version1=" + appVersion+"&Ios="+(Platform.OS === 'ios');
          setUrl(TempUrl);
          return false;
        }
        else {
          TempUrl = url + "?version=" + appVersion+"&Ios="+(Platform.OS === 'ios');
          setUrl(TempUrl);
          return false;
        }
      }
    }






    if (url.endsWith('UpdateVersion')) {
      // Set the new URL in state
      Alert.alert(
        'Update',
        'New Version Available, Kindly Update.',
        [
          {
            text: 'Update', onPress: () => {
              if (Platform.OS === 'ios') Linking.openURL("https://apps.apple.com/us/app/jcts/id6450176182");
              else Linking.openURL("https://play.google.com/store/apps/details?id=com.sathyatechnosoft.jcts");
            }
          },
        ],
        { cancelable: false }
      );

      // return false;
    }

    // Block the request
    return true;
  };



  return (
    <ErrorBoundary>
      <StatusBar backgroundColor="black" />
      {isConnected ? (
        <View style={{ flex: 1 }}>
          {Platform.OS === 'ios' ?
            <TouchableOpacity onPress={() => handleBackPress()} style={{ top: 15, left: 8, position: 'absolute', zIndex: 1 }} >
              <Image
                source={require('./assets/BackIcon.png')}
                style={{ width: 30, height: 30 }}
              />
            </TouchableOpacity> : ""
          }
          <WebView
            source={{ uri: url }}
            onLoadProgress={onLoadProgress}
            onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
            onNavigationStateChange={onNavigationStateChange}
            // {...(Platform.OS === 'ios' ? { originWhitelist: ['*'] } : {})}
            // headers={{ 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3' }}
            onError={(e) => { console.error("error :" + e) }}
            javaScriptEnabled={true}
            ref={webViewRef}
            setSupportMultipleWindows={false}
            originWhitelist={['*']}

          />
          {isLoading && (
            <Animated.View style={[styles.LoadingView, { opacity: fadeAnim }]}>
              <View style={styles.LoadingBox}>
                <Text style={{ color: 'black', fontSize: 22, margin: 5, fontWeight: 'bold', padding: 5 }}>Please Wait..</Text>
                <View style={styles.container}>
                  <ActivityIndicator size={50} color="#0878eb" style={{ size: 50, padding: 5 }} />
                  <Text style={{ padding: 5, paddingLeft: 10, alignSelf: 'center', color: "gray" }} >Loading...</Text>
                </View>
              </View>
            </Animated.View>
          )}
        </View>
      ) : (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ImageBackground source={require('./assets/error_page.jpg')} style={{ flex: 1, alignItems: "center", width: "100%", height: "150%" }} resizeMode="cover" >
            <View style={{ flex: 1.1 }} ></View>
            <Text style={{ flex: 1, top: 100, fontSize: 24, textAlign: 'center', fontWeight: "bold" }} >No internet connection</Text>
          </ImageBackground>
        </View>
      )}
    </ErrorBoundary>
  );
};
const styles = StyleSheet.create({
  LoadingView: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#00000099',
  },
  LoadingBox: {
    backgroundColor: '#ffffff',
    padding: 5,
    paddingTop: 0,
    borderRadius: 5,
    width: "85%"
  },
  container: {
    flexDirection: 'row',
    padding: 5,
  },
});

export default App;