import HistoryScreen from "@/screens/sign-learning/HistoryScreen";
import { useNavigation } from "expo-router";
import React, { useMemo } from "react";

export default function SignLearningHistoryPage() {
  const expoNavigation = useNavigation();

  const navigation = useMemo(
    () => ({
      addListener: (event: string, callback: () => void) =>
        expoNavigation.addListener(event as any, callback),
    }),
    [expoNavigation],
  );

  return <HistoryScreen navigation={navigation} />;
}
