/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */
import 'react-native-gesture-handler';
import React from 'react';
import 'react-native-get-random-values';
import Realm from 'realm';
import {News} from './src/realm/News';
import {RealmProvider, createRealmContext} from '@realm/react';
import NewsFeed from './src/screens/NewsFeed';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

const realmConfig: Realm.Configuration = {
  schema: [News],
};

function App(): JSX.Element {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <RealmProvider {...realmConfig}>
        <NewsFeed />
      </RealmProvider>
    </GestureHandlerRootView>
  );
}

export default App;
