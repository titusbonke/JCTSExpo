import React, { useState } from 'react';
import { View, Text } from 'react-native';

function ErrorBoundary(props) {
  const [hasError, setHasError] = useState(false);

  function handleCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.log(error, errorInfo);

    // Update state so the next render will show the fallback UI.
    setHasError(true);
  }

  if (hasError) {
    // You can render any custom fallback UI
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ImageBackground source={require('./assets/error_page.jpg')} style={{ flex: 1, alignItems: "center", width: "100%", height: "150%" }} resizeMode="cover" >
          <View style={{ flex: 1.1 }} ></View>
          <Text style={{ flex: 1, top: 100, fontSize: 24, textAlign: 'center' }} >Oops! Something went wrong.</Text>
        </ImageBackground>
      </View>
    );
  }

  return (
    <React.Fragment>
      {React.Children.map(props.children, (child) =>
        React.cloneElement(child, {
          onError: handleCatch
        })
      )}
    </React.Fragment>
  );
}

export default ErrorBoundary;
