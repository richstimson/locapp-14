import React, { useState, useEffect } from 'react';
import { Text, View, Button, Alert  } from 'react-native';
import * as Location from 'expo-location';
import { updatePosition } from './App';
//import Device from './src/device';

//const deviceSvc = new Device();

export default function Main() {
    const [location, setLocation] = useState(null);
    const [errorMsg, setErrorMsg] = useState(null);
    const [tracker, setTracker] = useState("");
    const [deviceName, setDeviceName] = useState("");
    const [deviceId, setDeviceId] = useState("");

    console.log( 'Main()');


    useEffect(() => {
        console.log( 'Main() useEffect()');
        
        (async () => {

/*
          deviceSvc.init()
          .then((resp)=> {
              if(resp !== null){
                  setTracker(resp.trackerName);
                  setDeviceName(resp.name);
                  setDeviceId(resp.id);
              }
          });
*/  
          let { status } = await Location.requestForegroundPermissionsAsync();
          if (status !== 'granted') {
            setErrorMsg('Permission to access location was denied');
            return;
          } else {

          let isLocationServicesEnabled = await Location.hasServicesEnabledAsync();
          let locationProviderStatus = await Location.getProviderStatusAsync();
          console.log(`loc status: ${JSON.stringify(locationProviderStatus)}`);

            if(isLocationServicesEnabled){
              //Get loc
              let loc = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.Highest});
              if(loc.coords !== null){
                console.log(`location: ${loc.coords.longitude}, ${loc.coords.latitude}`);
                setLocation(loc);
//                deviceSvc.setLocation(loc.coords.latitude, loc.coords.longitude);
                updatePosition(loc.coords.latitude, loc.coords.longitude);
              }

              //Watch loc
              await Location.watchPositionAsync({
                  enableHighAccuracy: true,
                  distanceInterval: 1,
                  timeInterval: 30000}, newLoc => {
                    console.log(`NEW location: ${newLoc.coords.longitude}, ${newLoc.coords.latitude}`);
                    setLocation(newLoc);
//                    deviceSvc.setLocation(newLoc.coords.latitude, newLoc.coords.longitude);
                    updatePosition(newLoc.coords.latitude, newLoc.coords.longitude);
                  });
            }
          }
  
        })();
        
    }, []);

    let text = 'Waiting..';
    if (errorMsg) {
        text = errorMsg;
    } else if (location) {
        text = "";//JSON.stringify(location);
   }

  
    return (
        <View />
    );
  /*
    return (
        <View>
            <Text>Device Name: {deviceName}</Text>
            <Text>Device ID: {deviceId}</Text>
            <Text>Tracker: {tracker}</Text>
            <Text>Lat: {location?.coords?.latitude}</Text>
            <Text>Lon: {location?.coords?.longitude}</Text>
            <Text>{text}</Text>
      </View>
    );
    */
}