import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';


import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import {
  LocationClient,
  AssociateTrackerConsumerCommand
} from '@aws-sdk/client-location';

import amplifyconfig from './src/amplifyconfiguration.json';
Amplify.configure(amplifyconfig);

// ---
async function myFunc() {
    console.log( 'myFunc');
  }
// ---

/*
const createClient = async () => {
  const session = await fetchAuthSession();
  const client = new LocationClient({
    credentials: session.credentials,
    region: amplifyconfig.aws_project_region
  });
  return client;
};

// UpdateDevicePosition API
const params = {
    TrackerName: 'trackerId',
    Updates: [
      {
        DeviceId: 'deviceId',
        Position: [-122.431297, 37.773972],
        SampleTime: new Date()
      }
    ]
  };
  
  const command = new BatchUpdateDevicePositionCommand(params);
  
  client.send(command, (err, data) => {
    if (err) console.error(err);
    if (data) console.log(data);
  });
  
  // GetDevicePosition API
  const client = await createClient();
  const params = {
    TrackerName: 'trackerId',
    DeviceId: 'deviceId'
  };

  const command = new GetDevicePositionCommand(params);
  client.send(command, (err, data) => {
    if (err) console.error(err);
    if (data) console.log(data);
  });
*/

  export default function App() {
    (async () => {
      await myFunc();
    })();
  
    return (
      <View style={styles.container}>
        <Text>Open up App.js to start working on your app!</Text>
        <StatusBar style="auto" />
      </View>
    );
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
