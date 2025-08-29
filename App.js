import React from "react";
import { Text, View } from "react-native";
import { useFonts } from "expo-font";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import Get_Started from "./assets/src/Screens/Get_Started";
import Create_Account from "./assets/src/Screens/Create_Account";
import Login from "./assets/src/Screens/Login";
import Forgot_Password from "./assets/src/Screens/Forgot_Password";
import Reset_Password from "./assets/src/Screens/Reset_Password";
import Home from "./assets/src/Screens/Home";

const Stack = createStackNavigator();

export default function App() {
  const [fontsLoaded] = useFonts({
    "CanvaSans-Regular": require("./assets/Fonts/canva-sans-regular.otf"),
    "Montserrat-Regular": require("./assets/Fonts/Montserrat-VariableFont_wght.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#fff",
        }}
      >
        <Text>Loading...</Text>
      </View>
    );
  }

  // Main Navigation
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="GetStarted"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="GetStarted" component={Get_Started} />
        <Stack.Screen name="CreateAccount" component={Create_Account} />
        <Stack.Screen name="ForgotPassword" component={Forgot_Password} />
        <Stack.Screen name="ResetPassword" component={Reset_Password} />
  <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="Login" component={Login} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
