import { Tabs } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../../constants/theme";

const StudioIcon = ({ color, size }) => (
  <MaterialCommunityIcons name="waveform" size={size} color={color} />
);

const MyVoiceIcon = ({ color, size }) => (
  <MaterialCommunityIcons name="account-music" size={size} color={color} />
);

const SongbookIcon = ({ color, size }) => (
  <MaterialCommunityIcons name="library-music" size={size} color={color} />
);

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.electricBlue,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 66,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 6,
        },
      }}
    >
      <Tabs.Screen
        name="studio"
        options={{
          title: "Studio",
          tabBarIcon: StudioIcon,
        }}
      />
      <Tabs.Screen
        name="my-voice"
        options={{
          title: "My Voice",
          tabBarIcon: MyVoiceIcon,
        }}
      />
      <Tabs.Screen
        name="songbook"
        options={{
          title: "Songbook",
          tabBarIcon: SongbookIcon,
        }}
      />
    </Tabs>
  );
}