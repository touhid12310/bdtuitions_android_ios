import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { useAuthStore } from '../store/authStore';
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';
import { colors } from '../constants/theme';

// Screen imports for non-tab screens
import TuitionDetailScreen from '../screens/main/TuitionDetailScreen';
import AssignmentDetailScreen from '../screens/main/AssignmentDetailScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import VerificationScreen from '../screens/profile/VerificationScreen';
import PaymentFormScreen from '../screens/payments/PaymentFormScreen';

export type RootStackParamList = {
  AuthStack: undefined;
  MainTabs: undefined;
  TuitionDetail: { tuitionId: number };
  AssignmentDetail: { assignmentId: number };
  EditProfile: undefined;
  Verification: undefined;
  PaymentForm: { assignmentId: number; amount: number };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const commonHeaderOptions = {
  headerStyle: { backgroundColor: colors.primary },
  headerTintColor: '#fff',
  headerTitleStyle: { fontWeight: '600' as const, fontSize: 16 },
  headerTitleAlign: 'center' as const,
  headerBackTitleVisible: false,
};

const RootNavigator: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!isAuthenticated ? (
          <Stack.Screen name="AuthStack" component={AuthStack} />
        ) : (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="TuitionDetail"
              component={TuitionDetailScreen}
              options={{
                headerShown: true,
                title: 'Tuition Details',
                ...commonHeaderOptions,
              }}
            />
            <Stack.Screen
              name="AssignmentDetail"
              component={AssignmentDetailScreen}
              options={{
                headerShown: true,
                title: 'Assignment Details',
                ...commonHeaderOptions,
              }}
            />
            <Stack.Screen
              name="EditProfile"
              component={EditProfileScreen}
              options={{
                headerShown: true,
                title: 'Edit Profile',
                ...commonHeaderOptions,
              }}
            />
            <Stack.Screen
              name="Verification"
              component={VerificationScreen}
              options={{
                headerShown: true,
                title: 'Verification',
                ...commonHeaderOptions,
              }}
            />
            <Stack.Screen
              name="PaymentForm"
              component={PaymentFormScreen}
              options={{
                headerShown: true,
                title: 'Make Payment',
                ...commonHeaderOptions,
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
});

export default RootNavigator;
