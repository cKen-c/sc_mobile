import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuth } from '../context/AuthContext';
import { ActivityIndicator, View } from 'react-native';
import { colors } from '../constants/theme';
import { Ionicons } from '@expo/vector-icons';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import FootballScreen from '../screens/FootballScreen';
import LeagueScreen from '../screens/LeagueScreen';
import MatchScreen from '../screens/MatchScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarStyle: { backgroundColor: colors.surface1, borderTopColor: colors.surface2 },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.text,
        headerShown: false,
        tabBarIcon: ({ color, size, focused }) => {
          let iconName;
          if (route.name === 'Accueil') {
            iconName = focused ? 'football' : 'football-outline';
          } else if (route.name === 'Favoris') {
            iconName = focused ? 'star' : 'star-outline';
          } else if (route.name === 'Profil') {
            iconName = focused ? 'person' : 'person-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Accueil" component={FootballScreen} />
      <Tab.Screen name="Favoris" component={FavoritesScreen} options={{ headerShown: false }} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Main" component={TabNavigator} />
            <Stack.Screen name="League" component={LeagueScreen} />
            <Stack.Screen name="Match" component={MatchScreen} />
            <Stack.Screen 
              name="TeamMatches" 
              component={require('../screens/TeamMatchesScreen').default} 
              options={{ headerShown: true }} 
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}