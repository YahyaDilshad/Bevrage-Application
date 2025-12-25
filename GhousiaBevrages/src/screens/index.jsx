import { StyleSheet, Text, View,Image } from 'react-native'
import React from 'react'
import ghousiaBevrages from '../assets/GhosiaBevrageslogo.png';

import { useNavigation } from '@react-navigation/native';

const index = () => {
    const navigation = useNavigation()
  return (
    <View
    style={styles.container}
    >
    <Image source={ghousiaBevrages} style={styles.logo} />
    <View style={styles.buttonContainer}>
    <Text onPress={()=>{
      navigation.navigate('SignUp')
    }} style={styles.signUp}>Sign Up</Text>
    <Text onPress={()=>{
      navigation.navigate('SignIn')
    }} style={styles.login}>Login Your Account</Text>
    </View>
    </View>
  )
}

export default index

const styles = StyleSheet.create({
  container:{
    flex : 1 ,
    display :'flex',
    alignItems : "center",
  },
   logo: {
    height: '20%',
    resizeMode: 'contain',
     marginTop : 200,
     marginBottom :50
     
  },
  signUp:{
    width : '80%',
    textAlign : 'center',
    paddingVertical : 10,
    borderRadius : 10,
    fontWeight : 'bold',
    color : 'white',
    backgroundColor : 'blue',
    marginBottom : 10
  },
  
  login:{
    width : '80%',
    textAlign : 'center',
    paddingVertical : 10,
    borderRadius : 10,
    fontWeight : 'bold',
    color : '',
    backgroundColor : '#eeee'
  },
  buttonContainer:{
    display :'flex',
    alignItems : "center",
    justifyContent : "center",
    width : '100%',
    gap : 10
 
  }
})