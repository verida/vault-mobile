
import BackgroundGeolocation from "react-native-background-geolocation";
import { getVeridaApp } from '../api'

export default class LocationTracking {

    static isReady = false
    static trackIntervalSeconds = 20

    static init() {
        ////
        // 1.  Wire up event-listeners
        //
    
        // This handler fires whenever bgGeo receives a location update.
        BackgroundGeolocation.onLocation(LocationTracking.onLocation, this.onError);
    
        // This handler fires when movement states changes (stationary->moving; moving->stationary)
        BackgroundGeolocation.onMotionChange(LocationTracking.onMotionChange);
    
        // This event fires when a change in motion activity is detected
        BackgroundGeolocation.onActivityChange(LocationTracking.onActivityChange);
    
        // This event fires when the user toggles location-services authorization
        BackgroundGeolocation.onProviderChange(LocationTracking.onProviderChange);
    
        ////
        // 2.  Execute #ready method (required)
        //
        BackgroundGeolocation.ready({
            // Geolocation Config
            desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
            distanceFilter: 10,
            // Activity Recognition
            stopTimeout: 1,
            // Application config
            //debug: true, // <-- enable this hear sounds for background-geolocation life-cycle.
            logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
            stopOnTerminate: false,   // <-- Allow the background-service to continue tracking when user closes the app.
            startOnBoot: true,        // <-- Auto start tracking when device is powered-up.
            batchSync: false,       // <-- [Default: false] Set true to sync locations to server in a single HTTP request.
            autoSync: false,         // <-- [Default: true] Set true to sync each location to server as it arrives.
            //preventSuspend: true,
            //heartbeatInterval: 20
        }, (state) => {
            console.log("- BackgroundGeolocation is configured and ready: ", state.enabled);
    
            if (!state.enabled) {
                ////
                // 3. Start tracking!
                //
                BackgroundGeolocation.start(function() {
                    console.log("- Start success");
                });
            }

            LocationTracking.enabled = true

            LocationTracking.saveLocation(location)

            /*BackgroundGeolocation.onHeartbeat((event) => {
                console.log("[onHeartbeat] ", event)
                LocationTracking.saveLocation(event.location)
            });*/
        });
    }

    static async saveLocation(location) {
        console.log('saveLocation called!')
        let datastore = LocationTracking.datastore
        if (!datastore) {
            const verida = await getVeridaApp()
            datastore = await verida.openDatastore('https://schemas.verida.io/location/tracking/schema.json')
            LocationTracking.datastore = datastore
        }

        console.log("have datastore", datastore)

        const now = (new Date()).toISOString()
        const data = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            locationAccuracy: location.coords.accuracy,
            altitude: location.coords.altitude,
            altitudeAccuracy: location.coords.altitude_accuracy,
            isMoving: location.is_moving,
            speed: location.coords.speed,
            speedAccuracy: location.coords.speed_accuracy,
            heading: location.coords.heading,
            headingAccuracy: location.coords.heading_accuracy,
            activityType: location.activity.type,
            timestamp: now
        }

        console.log("current location", location)
        console.log("current data", data)

        const result = await datastore.save(data)
        if (!result) {
            console.log(' - error -', datastore.errors)
        }
    }

    // todo: when should this be executed?
    static end() {
        BackgroundGeolocation.removeListeners();
    }

    static onLocation(location) {
        console.log('[location] -', location);
    }
    
    static onError(error) {
        console.warn('[location] ERROR -', error);
    }
    
    static onActivityChange(event) {
        console.log('[activitychange] -', event);  // eg: 'on_foot', 'still', 'in_vehicle'
    }
    
    static onProviderChange(provider) {
        console.log('[providerchange] -', provider.enabled, provider.status);
    }
    
    static onMotionChange(event) {
        console.log('[motionchange] -', event.isMoving, event.location);
        LocationTracking.saveLocation(event.location)
    }

}