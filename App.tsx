/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React, {useState, useCallback} from 'react';
import type {Node} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  Button,
  View,
  Linking,
} from 'react-native';

import {
  handleIncomingRedirect,
  login,
  getDefaultSession,
} from "@collaboware/solid-authn-react-native";
import useAsyncEffect from "use-async-effect";


import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

const Section = ({children, title}): Node => {
  const isDarkMode = useColorScheme() === 'dark';
  const [webId, setWebId] = useState<string | undefined>();

  const onSessionChanged = useCallback(() => {
    if (getDefaultSession().info.isLoggedIn) {
      setWebId(getDefaultSession().info.webId);
    } else {
      setWebId(undefined);
    }
  }, []);

  // Handle Incoming Redirect
  useAsyncEffect(async () => {
    await handleIncomingRedirect({
      restorePreviousSession: true,
    });
    onSessionChanged();
  }, [onSessionChanged]);

  // Login
  const onLoginPress = useCallback(
    async (issuer: string) => {
      // The makeUrl function will make a url using the mobile scheme
      // const callbackUrl = makeUrl("auth-callback");
      const callbackUrl = Linking.getInitialURL()
      await login({
        oidcIssuer: issuer,
        redirectUrl: callbackUrl,
        clientName: "My application",
      });
      onSessionChanged();
    },
    [onSessionChanged]
  );
  return (
    <View style={{ paddingTop: 100 }}>
    <Text>
      {webId ? `You are logged in as ${webId}` : "You are not logged in"}
    </Text>
    <Button
      title="Log in with SolidWeb.org (NSS)"
      onPress={() => onLoginPress("https://solidweb.org")}
    />
  </View>
  );
};

const App: () => Node = () => {
  const isDarkMode = useColorScheme() === 'dark';

  const backgroundStyle = {
    backgroundColor: isDarkMode ? Colors.darker : Colors.lighter,
  };

  return (
    <SafeAreaView style={backgroundStyle}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        style={backgroundStyle}>
        <Header />
        <View
          style={{
            backgroundColor: isDarkMode ? Colors.black : Colors.white,
          }}>
          <Section title="BÄÄÄÄM">
            Edit <Text style={styles.highlight}>App.js</Text> to change this
            screen and then come back to see your edits.
          </Section>
          <Section title="See Your Changes">
            <ReloadInstructions />
          </Section>
          <Section title="Debug">
            <DebugInstructions />
          </Section>
          <Section title="Learn More">
            Read the docs to discover what to do next:
          </Section>
          <LearnMoreLinks />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
