// React & Expo Imports
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Alert, Image } from 'react-native';
import React, { useState, useEffect } from 'react';
import MapView, { Marker, Circle } from 'react-native-maps';
import { FAB, Title } from 'react-native-paper';

// AWS & Amplify
import { Amplify } from 'aws-amplify';
import { fetchAuthSession } from 'aws-amplify/auth';
import {
  LocationClient,
  AssociateTrackerConsumerCommand,
  BatchUpdateDevicePositionCommand,
  GetDevicePositionCommand,
  PutGeofenceCommand,
  UpdateTrackerCommand
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

const trackerName = 'MobileTracker';
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

// GeoFence API -------------------------------------
const createGeofenceInput = { // PutGeofenceRequest
  CollectionName: "rs-geofence-collection", // required
  GeofenceId: "rs-geofence-2", // required
  Geometry: { // GeofenceGeometry
    Circle: { // Circle
      Center: [ // required
        -1.4301285333944764,
        52.94063620274229,
      ],
      Radius: 20, // required
    },
  },
};


const putGeoFenceCommand = new PutGeofenceCommand(createGeofenceInput);

async function createGeoFence() {
  console.log( 'createGeoFence' );    

  if(client) {  
    try {
      const putGeoFenceResponse = await client.send(putGeoFenceCommand);
      console.log( putGeoFenceResponse );
      // { // PutGeofenceResponse
      //   GeofenceId: "STRING_VALUE", // required
      //   CreateTime: new Date("TIMESTAMP"), // required
      //   UpdateTime: new Date("TIMESTAMP"), // required
      // };
      } catch (error) {
          console.log( 'geofence error' );
          console.log( error );
    }
  }
  else {
    console.log('no client ');
  }

}

// Update Tracker API -------------------------------------


const updateTrackerInput = { 
  TrackerName: 'MobileTracker',
  EventBridgeEnabled: true,
  Description: 'Bob Tracker',
};


/** NOTE: This command not be performed by unauth Role! */
const updateTrackerCommand = new UpdateTrackerCommand(updateTrackerInput);

async function updateTracker() {
  console.log( 'updateTracker()' );    

  if(client) {  
    try {
      const updateTrackerResponse = await client.send(updateTrackerCommand);
      console.log( updateTrackerResponse );

      } catch (error) {
          console.log( 'updateTracker error' );
          console.log( error );
    }
  }
  else {
    console.log('no client ');
  }

}

// --- App () ---

export default function App() {
//  console.log( 'App()');

  function onPressFab() {
    updatesEnbaled = !updatesEnbaled;
    console.log( "Updates %s", updatesEnbaled ? "enabled" : "disabled" );

    updatesEnbaled ? setFabIcon( 'minus' ) : setFabIcon( 'plus' );
  }

  const [myLocation, setmyLocation] = useState({latitude: 0, longitude: 0});
  const [fabIcon, setFabIcon] = (updatesEnbaled ? useState( 'minus' ) : useState( 'plus' ));

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
 
  // Note: RECURSIVE FUNCTION - never returns
  async function pollTrackerForUpdates() {
    console.log('pollTrackerForUpdates()');

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
    console.log( 'useEffect()');
    (async () => {
      client = await createClient();
      console.log( 'createGeoFence2' );  
      await createGeoFence();
//      await updateTracker(); // not possible from unauth role!

      await pollTrackerForUpdates(); // never returns
    })();
  }, []);
    


  return (
      <View style={styles.container}>
          <Main />
          <MapView style={styles.map}>
            {showMarker()}
            <Circle
              center={{
                longitude: -1.4301285333944764,
                latitude: 52.94063620274229,
              }}
              radius={20}
              strokeWidth={2}
              strokeColor="#3399ff"
              fillColor="rgba(50,50,255,0.1)"
//              fillColor="#80bfff"
            />
          </MapView>
          <FAB
            icon={fabIcon}
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
