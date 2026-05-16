import { Colors } from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface TabIconProps {
  name: IoniconsName;
  activeName: IoniconsName;
  color: string;
  focused: boolean;
}

function TabIcon({ name, activeName, color, focused }: TabIconProps) {
  return (
    <View style={styles.iconWrapper}>
      <Ionicons name={focused ? activeName : name} size={24} color={color} />
    </View>
  );
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  const basePadding = Platform.OS === 'ios' ? 24 : 8;
  const paddingBottom = Math.max(basePadding, insets.bottom + (Platform.OS === 'android' ? 8 : 0));
  const height = (Platform.OS === 'ios' ? 84 : 64) + (paddingBottom - basePadding);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: Colors.white,
          borderTopWidth: 1,
          borderTopColor: '#F3F4F6',
          height: height,
          paddingBottom: paddingBottom,
          paddingTop: 8,
          elevation: 12, // Android shadow
          shadowColor: '#000', // iOS shadow
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.06,
          shadowRadius: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="home-outline"
              activeName="home"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="simulados"
        options={{
          title: 'Simulados',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="document-text-outline"
              activeName="document-text"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      {/* <Tabs.Screen
        name="provas"
        options={{
          title: 'Provas',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="cloud-download-outline"
              activeName="cloud-download"
              color={color}
              focused={focused}
            />
          ),
        }}
      /> */}
      <Tabs.Screen
        name="missoes"
        options={{
          title: 'Missões',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="checkbox-outline"
              activeName="checkbox"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="perfil"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon
              name="person-outline"
              activeName="person"
              color={color}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
