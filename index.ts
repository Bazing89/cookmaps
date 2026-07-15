import React from 'react';
import { registerRootComponent } from 'expo';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import App from './App';

function Root() {
  return React.createElement(
    SafeAreaProvider,
    null,
    React.createElement(App, null),
  );
}

registerRootComponent(Root);
