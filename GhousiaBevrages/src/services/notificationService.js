import {permissionsAndroid , Platform} from 'react-native'
import messaging from "@react-native-firebase/messaging"
import axiosInstance from "../utils/axiosInstace"

export const androidnotificationpermission= ()=>{
    if(Platform.OS === "android" && Platform.Version >= 33){
        const granted = permissionsAndroid.request(
            permissionsAndroid.PERMISSION.POST_NOTIFICATIONS
        )
      return granted === permissionsAndroid.RESULT.GRANTED
    }
    return true
}

export const registeredforpushnotification = async (userId)=>{
    const permissionGranted = androidnotificationpermission()
    if(!permissionGranted){
        console.log("❌ Notification permission denied")
        return;
    }


// get permission
const authstatus = await messaging().requestPermission();
  const enabled = authstatus === messaging.AuthorizationStatus.AUTHORIZED ||
                  authstatus === messaging.AuthorizationStatus.PROVISIONAL

  
  if (!enabled) {
    console.log('❌ FCM permission not enabled');
    return;
  }

// get token
const token = messaging().getToken()
console.log("FCM Token" , token)

axiosInstance.post('/device/save-token', {
    method : 'POST',
    Headers : {"Content-type" : "application/json"},
    body :JSON.stringify({
     userId,
     token
    })
})
}
    
