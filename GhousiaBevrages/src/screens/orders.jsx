import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import useProductStore from '../store/productstore'
import { useEffect } from 'react';

const Orders = () => {
  const {fetchMyOrders , orders} = useProductStore();

  useEffect(() => {
    fetchMyOrders()
    console.log("ordersdata" , orders)
  }, [])
  
  return (
    <View>
      <Text>Orders</Text>
    </View>
  )
}

export default Orders

const styles = StyleSheet.create({})