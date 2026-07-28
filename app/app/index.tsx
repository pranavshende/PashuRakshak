import { Redirect } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' }}>
        <ActivityIndicator size="large" color="#059669" />
      </View>
    );
  }

  // If there's a user, go to farmer home, otherwise go to login
  if (user) {
    return <Redirect href="/(farmer)" />;
  }
  
  return <Redirect href="/(auth)/login" />;
}
