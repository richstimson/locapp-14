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

// import amplifyconfig from './src/amplifyconfiguration.json';
import amplifyconfig from './src/aws-exports.js';
Amplify.configure(amplifyconfig);

globalThis.ReadableStream = ReadableStream;

/*
async function myFunc() {
    console.log( 'myFunc');
  }
*/
/*
    try {
        const data = await client.send(updatePosCommand);
        console.log( 'data' );
        console.log (data);
    // process data.
    } catch (error) {
        // error handling.
        console.log( 'error' );
        console.log (error);
    } finally {
        // finally.
    }


*/


let session;
let client;

const createClient = async () => {
    console.log( 'createClient()');

    console.log( 'fetchAuthSession()');
    const session = await fetchAuthSession();

/*
    try {
        console.log( 'fetchAuthSession()');
        session = await fetchAuthSession();
        //        const session = await fetchAuthSession();
        
        console.log( 'session:' );
        console.log (session);
    // process data.
    } catch (error) {
        // error handling.
        console.log( 'session error:' );
        console.log (session);
    } finally {
        // finally.
    }
*/
    console.log( 'new LocationClient()');
    console.log( session );
    console.log( amplifyconfig.aws_project_region );
    console.log( 'bob');
    let myClient;

    try {    
        myClient = new LocationClient({
            credentials: session.credentials,
            region: amplifyconfig.aws_project_region
          });
        
        console.log( 'new client:' );
        console.log (myClient);
    // process data.
    } catch (error) {
        // error handling.
        console.log( 'myClient error' );
        console.log (myClient);
    } finally {
        // finally.
    }

    console.log( 'returning myClient:');
    console.log( myClient );


  return myClient;
};

// const client = await createClient();


// UpdateDevicePosition API
const updatePosParams = {
    TrackerName: 'MobileTracker',
    Updates: [
      {
        DeviceId: 'edf95663-1824-46ca-b37c-40d6e6ec8853',
        Position: [-1.42, 52.9],
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

/*
    client.send(updatePosCommand, (err, data) => {
        if (err) console.error(err);
        if (data) console.log(data);
      });

      client.send(getPosCommand, (err, data) => {
        if (err) console.error(err);
        if (data) console.log(data);
      });

*/

  // ----

async function updatePosition() {
    console.log('updatePosition()');
    console.log( client );
    try {
        const data = await client.send(updatePosCommand);
        console.log( 'data' );
        console.log (data);
    // process data.
    } catch (error) {
        // error handling.
        console.log( 'error' );
        console.log (error);

    //    const { requestId, cfId, extendedRequestId } = error.$metadata;
    //    console.log({ requestId, cfId, extendedRequestId });
        /**
         * The keys within exceptions are also parsed.
         * You can access them by specifying exception names:
         * if (error.name === 'SomeServiceException') {
         *     const value = error.specialKeyInException;
         * }
         */  
    } finally {
        // finally.
    }
}

async function getPosition() {
    console.log('getPosCommand()');
    console.log( client );

    client.send(getPosCommand, (err, data) => {
        if (err) console.error(err);
        if (data) console.log(data);
      });
}

// ---

export default function App() {
    console.log( 'App()');
    (async () => {
//      await myFunc();
      client = await createClient();
      console.log( 'App await client:')
      console.log(client);      
    })();

    console.log( 'App client:')
    console.log(client);
/*
    (async () => {
              client = await updatePosition();
    })();
*/        
    
    return (
      <View style={styles.container}>
{/*}
        <Button
            title="Press me"
            onPress={() => Alert.alert('Simple Button pressed')}
        />
*/}
        <Button
            title="Update position"
            onPress={() => updatePosition()}
        />
        
        <Button
            title="Get position"
            onPress={() => getPosition()}
        />
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
