import * as FileSystem from 'expo-file-system';
import { Amplify } from 'aws-amplify'
import { createDevice, updateDevice, updateLocation } from './graphql/mutations';
import { getDevice } from './graphql/queries'
import { generateClient } from 'aws-amplify/api';

import config from '../src/amplifyconfiguration.json';
import { listDevices } from './graphql/queries';
import * as subscriptions from './graphql/subscriptions';

Amplify.configure(config)

// Connect to Amplify/Appsync GraphQL API
const appsyncClient = generateClient();

export default class Device{
    constructor(){
        console.log( 'constructor()');
        this.fileName = `${FileSystem.documentDirectory}app.json`;
        this.id = "0";
        this.trackerName = "";
    }

    // Read ID from Expo File system
    async read() {
        console.log('read()');
        try{
            const { exists } = await FileSystem.getInfoAsync(this.fileName);
            if (!exists) await this.write({id:"0"});
            if (exists) {
                let data = await FileSystem.readAsStringAsync(this.fileName);
                console.log( 'data:' );
                console.log( data ); 
                return (data !== null && data !== "") ? JSON.parse(data) : null;
            }
        } 
        catch (err) {
            console.log(err);
        }        
    }

    // Write ID to Expo File system
    async write(content){
        console.log( 'write()' + this.fileName + content );
        await FileSystem.writeAsStringAsync(this.fileName, JSON.stringify(content));
    }



    async register(name,trackerName){
        console.log(`register() id==${this.id} name: ${name} trackerName: ${trackerName}`)
        console.log(typeof this.id);
        if(this.id == "0"){
            console.log('create');
            await this.create(name, trackerName);
            console.log(`register() new id==${this.id}`);
        } else {
            console.log(`update`);
            await this.update(this.id, name, trackerName);  
        }
    }

    async create(name,trackerName){
        console.log( `create ${name} ${trackerName}`);



        const resp = await appsyncClient
        .graphql({
            query: createDevice,
            variables: {    
                input: {
                    name: name, 
                    trackerName: trackerName
                }
            }
        });

        console.log(`createDevice response`);
        console.log(resp);
        this.id = resp.data.createDevice.id.toString(); // TO DO: Change to: this.id = 'edf95663-1824-46ca-b37c-40d6e6ec8853';
                                                        // This would probably work for updateLocation - 
                                                        // but wouldn't work for any of the device/dynamoDB queries as I think these require the correct device ID.
                                                        // Possibly doesn't matter right now, but need to check. 
                                                        // Another option maybe to manually create a dynamoDB entry with name 'rs-device-01' and ID 'edf95663-1824-46ca-b37c-40d6e6ec8853'
                                                        // or find out how create creates an ID..
        // Write the ID to the Expo File system 
        await this.write({id: this.id});       // Note: We could call.. 
                                               // await deviceSvc.write({id: 'edf95663-1824-46ca-b37c-40d6e6ec8853'}); 
                                               // .. before calling init (or register?) in main.js
                                               // .. to write the ID to the file - then create() would never be called, it would call update instead..
    }

    async update(id, name, trackerName){
        console.log(`update() id: ${id}, name: ${name}, tracker: ${trackerName}`);

//        let resp = await API.graphql(graphqlOperation(updateDevice, {input: {id, name, trackerName}}));
        const resp = await appsyncClient
            .graphql({
                query: updateDevice,
                variables: {
                    input: {
                        id: id,
                        name: name,
                        trackerName: trackerName
                    }
                }
            });
            // .subscribe({
            //     next: ({ data }) => {
            //         console.log( "Device updated (subscription) ***********");
            //         console.log( data );
            //     }
            // })
            console.log( 'update resp');
            console.log( resp );
    
    
    }

    async init(){
        console.log( 'init()');
        
        // --- Subscribe to creation of Device
        const createSubResp = await appsyncClient
        .graphql({ query: subscriptions.onCreateDevice })
        .subscribe({
        next: ({ data }) => {
            console.log( "Device created (subscription) ***********");
            console.log(data);
        },
        error: (error) => {
            console.log( "Device created (subscription) ERROR ***********");
            console.warn(error)
        }});
        console.log( 'create sub resp');
        console.log( createSubResp );
        // ---

        // --- Subscribe to update of Device
        const updateSubResp = await appsyncClient
        .graphql({ query: subscriptions.onUpdateDevice })
        .subscribe({
        next: ({ data }) => {
            console.log( "Device updated (subscription) ***********");
            console.log(data);
        },
        error: (error) => {
            console.log( "Device updated (subscription) ERROR ***********");
            console.warn(error)
        }});
        console.log( 'update sub resp');
        console.log( updateSubResp );
        // ---


        // Read ID from Expo file system
        let data = await this.read();
        console.log( 'read data:');
        console.log( data );
        if(data !== null){
            this.id = data.id.toString();
            console.log(`init() this.id: ${this.id}`);

            if(this.id !== "0"){
  //              let resp = await API.graphql(graphqlOperation(getDevice, {id: this.id}));
                console.log( 'getDevice query - get trackerName from device ID');
                if( appsyncClient ) {
                    // Get trackerName from device id
                    const resp = await appsyncClient.graphql({
                        query: getDevice,
                        variables: {
    //                        input: {
                                id: this.id
    //                        }
                        }
                    });
                    console.log('init resp ');
                    console.log( resp );
                    if( resp !== null && resp !== undefined) {
                        this.trackerName = resp.data.getDevice.trackerName;
                        console.log( `Saved tracker name: ${this.trackerName}` );
                        return resp.data.getDevice;
                    }
                    else {
                        console.log( `Device ${this.id} not found in DB` );
                        return null;
                    }
                                    }
                else {
                    console.log( 'no appsyncClient' );
                }
            } else {
                console.log( 'null id' );
                return null;
            }
        } else {
            await this.write({id: "0"});
        }
        console.log( 'init failed' );
    }

    async setLocation(lat, lon){
        console.log( `setLocation() lat: ${lat} long: ${lon}`);
        console.log( `trackerName: ${this.trackerName}, deviceId: ${this.id}`);
 //       return await API.graphql(graphqlOperation(updateLocation, { trackerName: this.trackerName, deviceId: this.id, Latitude: lat, Longitude: lon }));
        const resp = await appsyncClient.graphql({
            query: updateLocation,
            variables: {
//                input: {
                    trackerName: this.trackerName, 
                    deviceId: this.id, 
                    Latitude: lat, 
                    Longitude: lon
//                }
            }
        });
        console.log('setLocation resp ');
        console.log( resp );
    }   
}