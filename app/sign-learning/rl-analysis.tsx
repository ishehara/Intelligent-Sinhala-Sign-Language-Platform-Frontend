import RLAnalysisScreen from "@/screens/sign-learning/RLAnalysisScreen";
import { useNavigation } from "expo-router";
import React, { useMemo } from "react";

export default function SignLearningRLAnalysisPage() {
  const expoNavigation = useNavigation();

  const navigation = useMemo(
    () => ({
      addListener: (event: string, callback: () => void) =>
        expoNavigation.addListener(event as any, callback),
    }),
    [expoNavigation],
  );

  return <RLAnalysisScreen navigation={navigation} />;
}
