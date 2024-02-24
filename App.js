import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';


import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import {
  LocationClient,
  AssociateTrackerConsumerCommand,
  BatchUpdateDevicePositionCommand,
  GetDevicePositionCommand
} from '@aws-sdk/client-location';

import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { ReadableStream } from 'web-streams-polyfill/ponyfill';

import amplifyconfig from './src/aws-exports.js';
import Main from './main.js';

// ---

Amplify.configure(amplifyconfig);

globalThis.ReadableStream = ReadableStream;

let client;

const createClient = async () => {
    console.log( 'createClient()');

    const session = await fetchAuthSession();

    let myClient;

    try {    
        myClient = new LocationClient({
            credentials: session.credentials,
            region: amplifyconfig.aws_project_region
        });
        // process data.        
//        console.log( 'new client:' );
//        console.log (myClient);
    } catch (error) {
        // error handling.
        console.log( 'myClient error' );
        console.log (myClient);
    }

  return myClient;
};


// UpdateDevicePosition API
const updatePosParams = {
    TrackerName: 'MobileTracker',
    Updates: [
      {
        DeviceId: 'edf95663-1824-46ca-b37c-40d6e6ec8853',
        Position: [-1.423, 52.92],
        SampleTime: new Date()
      }
    ]
  };
  
const updatePosCommand = new BatchUpdateDevicePositionCommand(updatePosParams);
  
// GetDevicePosition API

const getPosParams = {
    TrackerName: 'MobileTracker',
    DeviceId: 'edf95663-1824-46ca-b37c-40d6e6ec8853'
};

const getPosCommand = new GetDevicePositionCommand(getPosParams);

async function updatePosition() {
    console.log('updatePosition()');
//    console.log( `Input: ${JSON.stringify(updatePosCommand.input.Updates)}` );
    console.log( `DeviceId: ${updatePosCommand.input.Updates[0].DeviceId}` );
    console.log( `Pos: ${updatePosCommand.input.Updates[0].Position}` );

    try {
        const data = await client.send(updatePosCommand);
//        console.log( 'data' );
//        console.log (data);
    // process data.
    } catch (error) {
        // error handling.
        console.log( 'error' );
        console.log (error);
    }
}

module.exports.updatePosition = updatePosition;

async function getPosition() {
    console.log('getPosCommand()');
//    console.log( client );

    client.send(getPosCommand, (err, data) => {
        if (err) 
        {
            console.log( 'error:' );
            console.error(err);
        }
        
        if (data && data.Position) 
        { 
            console.log(data.Position);
        }
      });
}

// ---
async function pollTrackerForUpdates() {
    console.log('pollTrackerForUpdates()');

    await getPosition();
    await new Promise(resolve => setTimeout(resolve, 10000));
    await pollTrackerForUpdates();
}
  

// ---

export default function App() {
    console.log( 'App()');
    (async () => {
      client = await createClient();
//      await pollTrackerForUpdates();
    })();

    return (
        <View style={styles.container}>
            <Main />
        </View>
    );
    /*
    return (
      <View style={styles.container}>
        <Button
            title="Update position"
            onPress={() => updatePosition()}
        />
        
        <Button
            title="Get position"
            onPress={() => getPosition()}
        />
        <StatusBar style="auto" />
      </View>
    );
    */
  }
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
