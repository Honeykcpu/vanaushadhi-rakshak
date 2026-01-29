// File: App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import Welcome from "./components/Welcome";
import Home from "./components/Home";
import ExploreAllPlants from "./components/ExploreAllPlants";
import Tulsi from "./components/Tulsi";
import AloeVera from "./components/AloeVera";
import Ashwagandha from "./components/Ashwagandha";
import Neem from "./components/Neem";
import Mint from "./components/Mint";
import Brahmi from "./components/Brahmi";
import Peppermint from "./components/Peppermint";
import GeoTaggedPlantInput from "./components/GeoTaggedPlantInput";
import ClimateData from "./components/ClimateData";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Welcome"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Welcome" component={Welcome} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="ExploreAllPlants" component={ExploreAllPlants} />
        <Stack.Screen name="Tulsi" component={Tulsi} />
        <Stack.Screen name="AloeVera" component={AloeVera} />
        <Stack.Screen name="Ashwagandha" component={Ashwagandha} />
        <Stack.Screen name="Neem" component={Neem} />
        <Stack.Screen name="Mint" component={Mint} />
        <Stack.Screen name="Brahmi" component={Brahmi} />
        <Stack.Screen name="Peppermint" component={Peppermint} />
        <Stack.Screen name="GeoTaggedPlantInput" component={GeoTaggedPlantInput} />
        <Stack.Screen name="ClimateData" component={ClimateData} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
