// React & Expo Imports
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Alert, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import MapView, { Marker } from 'react-native-maps';
import { FAB, Title } from 'react-native-paper';

// AWS & Amplify
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import {
  LocationClient,
  AssociateTrackerConsumerCommand,
  BatchUpdateDevicePositionCommand,
  GetDevicePositionCommand
} from '@aws-sdk/client-location';

// Fix ReadableStream error
import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { ReadableStream } from 'web-streams-polyfill/ponyfill';

// Local imports
import amplifyconfig from './src/aws-exports.js';
import Main from './main.js';

// -------------------------------------------------

// Globals
let client;
let updatesEnbaled = true;
// -------
Amplify.configure(amplifyconfig);

globalThis.ReadableStream = ReadableStream;


const createClient = async () => {
//    console.log( 'createClient()');

    const session = await fetchAuthSession();

    let myClient;

    try {    
        myClient = new LocationClient({
            credentials: session.credentials,
            region: amplifyconfig.aws_project_region
        });    
        console.log( 'New client created' );
    } catch (error) {
        // error handling.
        console.log( 'myClient error' );
//        console.log (myClient);
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
        SampleTime: new Date(),
        Accuracy: { // PositionalAccuracy
          Horizontal: 1, // required
      }}
    ]
  };
  
const updatePosCommand = new BatchUpdateDevicePositionCommand(updatePosParams);

async function updatePosition(lat, long) {
  // console.log( `updatesEnbaled: ${updatesEnbaled}` );

  if( updatesEnbaled ) {
//    console.log('updatePosition()');

    updatePosCommand.input.Updates[0].Position[0] = long;
    updatePosCommand.input.Updates[0].Position[1] = lat;
    updatePosCommand.input.Updates[0].SampleTime = new Date();

    // console.log( `DeviceId: ${updatePosCommand.input.Updates[0].DeviceId}` );
    

    if(client) {  
      try {
        const data = await client.send(updatePosCommand);
        console.log( `Tx Pos: ${updatePosCommand.input.Updates[0].Position}` );
//        console.log( 'data' );
//        console.log (data);
      } catch (error) {
          // error handling.
          console.log( 'error' );
          console.log (error);
      }
    }
  }
  else {
//    console.log('update not sent');
  }
}

module.exports.updatePosition = updatePosition;

// GetDevicePosition API

const getPosParams = {
  TrackerName: 'MobileTracker',
  DeviceId: 'edf95663-1824-46ca-b37c-40d6e6ec8853'
};

const getPosCommand = new GetDevicePositionCommand(getPosParams);
// ---




// --- App () ---

export default function App() {
//  console.log( 'App()');

  function onPressFab() {
    updatesEnbaled = !updatesEnbaled;
    console.log( "Updates %s", updatesEnbaled ? "enabled" : "disabled" );
  }

  const [myLocation, setmyLocation] = useState({latitude: 0, longitude: 0});

  const myMarker = {
    key: 1,
    title: "Ice Cream Van",
    description: "Michele's Ices"
  }
  
  const showMarker = () => {
/*
    console.log( 'showMarker()');
    console.log( {myMarker} );
    console.log( myLocation );
*/    
    return (
      <Marker
        key={myMarker.key}
        coordinate={myLocation}
        title={myMarker.title}
        description={myMarker.description}
        image={require('./assets/ice-cream-truck3.png')}
      >

      </Marker>
    );
  }
  /* 
          <Image 
          uri={require('./assets/ice-cream-truck3.png')}
          style={styles.markerImage}
        />
  */

  async function pollTrackerForUpdates() {
//    console.log('pollTrackerForUpdates()');

    await getPosition();
    await new Promise(resolve => setTimeout(resolve, 10000));
    await pollTrackerForUpdates();

  }
    
  async function getPosition() {
//    console.log('getPosition()');

    if(client) {
      client.send(getPosCommand, (err, data) => {
        if (err) 
        {
            console.log( 'error:' );
            console.error(err);
        }
        
        if (data && data.Position) 
        { 
            console.log(`Rx Pos: ${data.Position[0]},${data.Position[1]}`);
            setmyLocation({ longitude: data.Position[0], latitude: data.Position[1] });
        }
      });
    }
  }

  useEffect(() => {
//    console.log( 'useEffect()');
    (async () => {
      client = await createClient();
      await pollTrackerForUpdates();
    })();
  }, []);
    


  return (
      <View style={styles.container}>
          <Main />
          <MapView style={styles.map}>
            {showMarker()}
          </MapView>
          <FAB
            icon="plus"
            style={styles.fab}
            onPress={onPressFab}
          />

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
  map: {
      width: '100%',
      height: '100%',
  },
  markerImage: {
    width: 35,
    height: 35,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    top: 30,
  },
});
