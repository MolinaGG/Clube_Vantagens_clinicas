import { Tabs } from 'expo-router';
import { Calendar, Clock, Settings, CheckCircle, Wallet, Megaphone } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Agenda',
          tabBarIcon: ({ size, color }) => (
            <Calendar size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          title: 'Carteira',
          tabBarIcon: ({ size, color }) => (
            <Wallet size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="ads"
        options={{
          title: 'Anúncios',
          tabBarIcon: ({ size, color }) => (
            <Megaphone size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="availability"
        options={{
          title: 'Horários',
          tabBarIcon: ({ size, color }) => (
            <Clock size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="validate"
        options={{
          title: 'Validar',
          tabBarIcon: ({ size, color }) => (
            <CheckCircle size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Config',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} strokeWidth={2} />
          ),
        }}
      />
    </Tabs>
  );
}
