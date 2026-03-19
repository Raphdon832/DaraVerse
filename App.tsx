import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { preloadClickSound, unloadClickSound } from "./src/audio/clickSound";
import { AuthProvider } from "./src/context/AuthContext";
import { AppStateProvider } from "./src/context/AppStateContext";
import RootNavigator from "./src/navigation/RootNavigator";

export default function App() {
  useEffect(() => {
    void preloadClickSound();

    return () => {
      void unloadClickSound();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <AuthProvider>
        <AppStateProvider>
          <RootNavigator />
        </AppStateProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
