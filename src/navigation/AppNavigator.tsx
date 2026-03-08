import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import React from "react";
import { RootStackParamList } from "../types";

// Import screens
import AIAssessmentScreen from "../screens/AIAssessmentScreen";
import AILoadingScreen from "../screens/Ailoadingscreen";
import AIResultScreen from "../screens/Airesultscreen";
import ChildCategoryScreen from "../screens/ChildCategoryScreen";
import ChildHomeScreen from "../screens/ChildHomeScreen";
import OnboardingScreen from "../screens/OnboardingScreen";
import ParentCategoryScreen from "../screens/ParentCategoryScreen";
import ParentHomeScreen from "../screens/ParentHomeScreen";
import SelectionModeScreen from "../screens/SelectionModeScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Onboarding"
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="SelectionMode" component={SelectionModeScreen} />
        <Stack.Screen name="ChildHome" component={ChildHomeScreen} />
        <Stack.Screen name="ParentHome" component={ParentHomeScreen} />
        <Stack.Screen name="ChildCategory" component={ChildCategoryScreen} />
        <Stack.Screen name="ParentCategory" component={ParentCategoryScreen} />
        <Stack.Screen name="AIAssessment" component={AIAssessmentScreen} />
        <Stack.Screen name="AILoading" component={AILoadingScreen} />
        <Stack.Screen name="AIResult" component={AIResultScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
