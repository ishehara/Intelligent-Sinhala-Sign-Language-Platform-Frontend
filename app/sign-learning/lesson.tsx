import SignLearningScreen from "@/screens/sign-learning/SignLearningScreen";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useMemo } from "react";

export default function SignLearningLessonPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    levelId?: string;
    levelTitle?: string;
    signs?: string;
    levelIndex?: string;
    signType?: string;
  }>();

  // Parse signs from JSON string (passed from HomeScreen navigation adapter)
  const parsedSigns = useMemo(() => {
    try {
      return params.signs ? JSON.parse(params.signs) : undefined;
    } catch {
      return undefined;
    }
  }, [params.signs]);

  // Build route prop matching what SignLearningScreen expects
  const route = useMemo(
    () => ({
      params: {
        levelId: params.levelId,
        levelTitle: params.levelTitle,
        signs: parsedSigns,
        levelIndex: params.levelIndex ? Number(params.levelIndex) : undefined,
        signType: params.signType as "static" | "dynamic" | undefined,
      },
    }),
    [
      params.levelId,
      params.levelTitle,
      parsedSigns,
      params.levelIndex,
      params.signType,
    ],
  );

  // Navigation adapter for legacy React Navigation API -> Expo Router
  const navigation = useMemo(
    () => ({
      goBack: () => router.back(),
    }),
    [router],
  );

  return <SignLearningScreen route={route} navigation={navigation} />;
}
