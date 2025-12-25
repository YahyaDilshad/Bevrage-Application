import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Home from "../screens/home.jsx";
import Category from "../screens/Categories.jsx";
import Cart from "../screens/Viewcart.jsx";
import Search from "../screens/search.jsx";
import SignIn from "../screens/Auth/signin.jsx";
import SignUp from "../screens/Auth/signUp.jsx";
import Index from "../screens/index.jsx"
const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator initialRouteName="index" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" component={Index} />
      <Stack.Screen name="home" component={Home} />
      <Stack.Screen name="Categories" component={Category} />
      <Stack.Screen name="Cart" component={Cart} />
      <Stack.Screen name="Search" component={Search} />
      <Stack.Screen name="SignIn" component={SignIn} />
      <Stack.Screen name="SignUp" component={SignUp} />
    </Stack.Navigator>
  );
}
