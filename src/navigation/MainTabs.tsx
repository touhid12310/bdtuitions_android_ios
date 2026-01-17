import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import DashboardScreen from '../screens/main/DashboardScreen';
import TuitionsScreen from '../screens/main/TuitionsScreen';
import ApplicationsScreen from '../screens/main/ApplicationsScreen';
import AssignmentsScreen from '../screens/main/AssignmentsScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { colors } from '../constants/theme';
import { useAuthStore } from '../store/authStore';

export type MainTabParamList = {
  Dashboard: undefined;
  Tuitions: undefined;
  Applications: undefined;
  Assignments: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainTabs: React.FC = () => {
  const teacher = useAuthStore((state) => state.teacher);
  const unreadCount = teacher?.unread_notifications_count || 0;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
              break;
            case 'Tuitions':
              iconName = focused ? 'school' : 'school-outline';
              break;
            case 'Applications':
              iconName = focused ? 'file-document' : 'file-document-outline';
              break;
            case 'Assignments':
              iconName = focused ? 'briefcase' : 'briefcase-outline';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'circle';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: colors.primary,
          height: 50,
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 16,
        },
        headerTitleAlign: 'center',
        headerStatusBarHeight: 0,
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="Tuitions"
        component={TuitionsScreen}
        options={{ title: 'Tuitions' }}
      />
      <Tab.Screen
        name="Applications"
        component={ApplicationsScreen}
        options={{ title: 'Applications' }}
      />
      <Tab.Screen
        name="Assignments"
        component={AssignmentsScreen}
        options={{ title: 'Assignments' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
        }}
      />
    </Tab.Navigator>
  );
};

export default MainTabs;
