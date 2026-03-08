import ProfileScreen from "@/screens/sign-learning/ProfileScreen";
import { useNavigation } from "expo-router";
import React, { useMemo } from "react";

export default function SignLearningProfilePage() {
  const expoNavigation = useNavigation();

  const navigation = useMemo(
    () => ({
      addListener: (event: string, callback: () => void) =>
        expoNavigation.addListener(event as any, callback),
    }),
    [expoNavigation],
  );

  return <ProfileScreen navigation={navigation} />;
}
