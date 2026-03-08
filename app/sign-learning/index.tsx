import HomeScreen from "@/screens/sign-learning/HomeScreen";
import { useNavigation, useRouter } from "expo-router";
import React, { useMemo } from "react";

export default function SignLearningIndex() {
  const router = useRouter();
  const expoNavigation = useNavigation();

  // Adapter: translate old React Navigation API -> Expo Router
  const navigation = useMemo(
    () => ({
      navigate: (screen: string, params?: Record<string, unknown>) => {
        if (screen === "SignLearning") {
          router.push({
            pathname: "/sign-learning/lesson",
            params: {
              levelId: params?.levelId as string,
              levelTitle: params?.levelTitle as string,
              signs: JSON.stringify(params?.signs || []),
              levelIndex: String(Number(params?.levelIndex) || 1),
              totalLevels: String(Number(params?.totalLevels) || 9),
              signType: (params?.signType as string) || "static",
            },
          } as any);
        }
      },
      goBack: () => router.back(),
      addListener: (event: string, callback: () => void) =>
        expoNavigation.addListener(event as any, callback),
    }),
    [router, expoNavigation],
  );

  return <HomeScreen navigation={navigation as any} />;
}
