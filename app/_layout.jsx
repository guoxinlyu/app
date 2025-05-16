// Import the Stack navigator from expo-router
import { Stack } from "expo-router";

/**
 * The RootLayout component defines the global stack navigation layout.
 * This layout is shared across all screens in the app.
 */
export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: "#4CAF50" }, 
        headerTintColor: "#fff",                      
        headerTitleAlign: "center",                   
        headerTitle: "EcoCache",                      
      }}
    />
  );
}
