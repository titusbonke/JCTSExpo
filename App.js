import React, { useState, useEffect, useRef } from 'react';
import { View, ActivityIndicator, StyleSheet, BackHandler, Alert, Text, StatusBar, Platform, ImageBackground, Animated } from 'react-native';
import { WebView } from 'react-native-webview';
import ErrorBoundary from "./ErrorBoundary";
import NetInfo from '@react-native-community/netinfo';
import * as Linking from 'expo-linking';
import { TouchableOpacity, Image } from 'react-native';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';


const App = () => {
  var AppUrl = 'https://jcts.org/';
  const [isLoading, setIsLoading] = useState(true);
  const [GoBack, setGoBack] = useState(true);
  // const [url, setUrl] = useState('https://mobile.sathya.one/');
  const [url, setUrl] = useState();
  const [isConnected, setIsConnected] = useState(true);
  const GoBackRef = useRef(GoBack);
  const webViewRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

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




  // Storing a variable
  const storeVariable = async (Key, Value) => {
    try {
      await AsyncStorage.setItem(Key, Value);
      console.log('Variable stored successfully.');
    } catch (error) {
      console.error('Error storing variable:', error);
    }
  };

  // Retrieving a variable
  const getVariable = async (Key) => {
    try {
      return await AsyncStorage.getItem(Key);
    } catch (error) {
      console.error('Error retrieving variable:', error);
      return null;
    }
  };


  // Linking.addEventListener('url', (event) => {
  //   const parsedUrl = new URL(event.url);
  //   console.log(parsedUrl);
  //   // Use the parameters in your app logic
  // });
  


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
            { text: 'Exit', onPress: () => {clearData();BackHandler.exitApp();} },
          ],
          { cancelable: false }
        );
      }
      return true;
    }
    return true;
  };

  const clearData = async () => {
    await webViewRef.current.clearCache(true);
    // await webViewRef.current.clearCookies();
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
    const { url, navigationType  } = event;
    setIsLoading(true);
    console.log(url);
    // console.log(event);
    // checkForAppUpdate();

    if (Platform.OS === 'ios') {
      if (!url.startsWith('http')) {
        // Set the new URL in state
        console.log("hit");
        Linking.openURL(url);
        webViewRef.current.stopLoading();
        return false;
      }
    }

    fetch(url, { method: 'HEAD' })
      .then((response) => {
        const contentDisposition = response.headers.get('content-disposition');
        if (contentDisposition && contentDisposition.toLowerCase().includes('attachment')) {
          
          webViewRef.current.stopLoading();
          // console.log(response)
          // response.headers.set('content-type','application/pdf');
          // // console.log(response);
          // setUrl(url);
          // // console.log(response.headers);
          Linking.openURL(url);
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
    if (url.includes("/Transaction/SelectPrinter")) {
      Linking.openURL(url);
      return false;
    }

    if (url.includes("CheckVersion")) {
      const appVersion = Constants.manifest.version;
      if (!url.includes("version")) {
        if (url.includes("?")) {
          // console.log('App Version:', appVersion);    
          var TempUrl = url + "&version1=" + appVersion + "&ios="+(Platform.OS === 'ios');
          setUrl(TempUrl);
          return false;
        }
        else {
          var TempUrl = url + "?version=" + appVersion + "&ios="+(Platform.OS === 'ios');
          setUrl(TempUrl);
          return false;
        }
      }
    }

    if (url.includes("https://console.circle7.robeeta.com/signin?code=")) {
      var TempUrl = url.replace("console.circle7.robeeta.com", "mobile.circle7.robeeta.com");
      // console.log(TempUrl);
      storeVariable("CodeUrl",TempUrl);
      // console.log("Retrived url : "+ getVariable("CodeUrl"))
      setUrl(TempUrl);
      return false;
    }

    if (url.includes("/SignOut")) {
      AsyncStorage.clear();
      return true;
    }

    if (url.endsWith('UpdateVersion')) {
      // Set the new URL in state
      Alert.alert(
        'Update',
        'New Version Available, Kindly Update.',
        [
          {
            text: 'Update', onPress: () => {
              if (Platform.OS === 'ios') Linking.openURL("https://apps.apple.com/us/app/sathya-one/id6450176182");
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

  const handleMessage = (event) => {
    // Display the message received from the WebView
    console.log(event);
    alert(event.nativeEvent.data);
  };

  function UrlCheck() {
    try {
      if (url==undefined) {
        const variableValue = getVariable("CodeUrl").then(a => {
          console.log('Value:', a);
          var CodeUrl = a??AppUrl;
          setUrl(CodeUrl);
          return url;
        });
      }
      else return url;
    } catch (error) {
      console.error('Error:', error);
    }

  }

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
            source={{ uri: UrlCheck() }}
            onLoadProgress={onLoadProgress}
            onShouldStartLoadWithRequest={onShouldStartLoadWithRequest}
            onNavigationStateChange={onNavigationStateChange}
            {...(Platform.OS === 'ios' ? { originWhitelist: ['*'] } : {})}
            headers={{ 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3','content-type':'application/pdf'}}
            onError={(e) => { console.log(e) }}
            javaScriptEnabled={true}
            ref={webViewRef}
            setSupportMultipleWindows={false}
            onMessage={handleMessage}
            onFileDownload={(e) => { console.log("test") }}
            domStorageEnabled ={true}
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