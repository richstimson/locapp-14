import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';
import React, { useState, useEffect } from 'react';
//import { useState } from 'react';

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
import MapView, { Marker } from 'react-native-maps';

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
        console.log( 'new client:' );
//        console.log (myClient);
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
  
// GetDevicePosition API

const getPosParams = {
    TrackerName: 'MobileTracker',
    DeviceId: 'edf95663-1824-46ca-b37c-40d6e6ec8853'
};

const getPosCommand = new GetDevicePositionCommand(getPosParams);

async function updatePosition(lat, long) {
    console.log('updatePosition()');
//    console.log( client );

    updatePosCommand.input.Updates[0].Position[0] = long;
    updatePosCommand.input.Updates[0].Position[1] = lat;
    updatePosCommand.input.Updates[0].SampleTime = new Date();

    console.log( `DeviceId: ${updatePosCommand.input.Updates[0].DeviceId}` );
    console.log( `Pos: ${updatePosCommand.input.Updates[0].Position}` );

    if(client) {
      const data = await client.send(updatePosCommand);
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
    }
    */
  }

  }

module.exports.updatePosition = updatePosition;


let globalLocation = {
    latitude: 52.9,
    longitude: -1.4
  }


// ---

  

// ---


  
  /*
  const showMarker = () => {
    console.log( 'showMarker()');
    console.log( {myMarker} );
    console.log( myLocation );
    
    return (
      <Marker
        key={myMarker.key}
        coordinate={myLocation}
        title={myMarker.title}
        description={myMarker.description}
      />
    );
  }
  */

// ---

let x = 52.0000000000001, y = -1.523;

export default function App() {
    console.log( 'App()');

    const [myLocation, setmyLocation] = useState({latitude: 52.000000001, longitude: -1.000000001});
//    const [tokyoRegion, setTokyoRegion] = useState({latitude: 52.9, longitude: -1.4});

    const myMarker = {
        key: '1',
        title: 'My title',
        description: 'RS marker'
      };

      async function pollTrackerForUpdates() {
        console.log('pollTrackerForUpdates()');

//        setTokyoRegion( {latitude: 52.92, longitude: -5.523} );
//        setmyLocation( {latitude: 52.92, longitude: -5.523} );
        await getPosition();
        await new Promise(resolve => setTimeout(resolve, 10000));
        await pollTrackerForUpdates();
    
        }
    
        async function getPosition() {
          console.log('getPosition()');
      //    console.log( client );
        if(client) {
      
          client.send(getPosCommand, (err, data) => {
              if (err) 
              {
                  console.log( 'error:' );
                  console.error(err);
              }
              
              if (data && data.Position) 
              { 
                  console.log(`Long: ${data.Position[0]}, Lat: ${data.Position[1]}`);
                  setmyLocation({ longitude: data.Position[0], latitude: data.Position[1] });

                  // setmyLocation( {latitude: 52.92, longitude: -5.523} );
                  //setmyLocation( {latitude: x, longitude: y} );
                  //x+=0.0000000000000001;
                  //console.log( `x: ${x}`);
              }
            });
        }
      }
      




    useEffect(() => {
      console.log( 'useEffect()');
      (async () => {
        client = await createClient();
        await pollTrackerForUpdates();
      })();
    }, []);
  

//    console.log( this.myLocation );
/*
const tokyoRegion = {
    latitude: 52.9,
    longitude: -1.4,
  };
*/
    return (
        <View style={styles.container}>
            <Main />
            <MapView style={styles.map}>
{/*              {showMarker()} */}
                <Marker coordinate={myLocation} />
{/*}                <Marker
                    key={myMarker.key}
                    title={myMarker.title}
                    coordinate={10, 20}
                    description={myMarker.description}
                />
    */}
            </MapView>
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
    map: {
        width: '100%',
        height: '100%',
      },
  });
