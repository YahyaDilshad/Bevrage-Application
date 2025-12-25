import React from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import useCartStore from "../store/cartstore";
import { useNavigation } from "@react-navigation/native";



const ViewCart = () => {
  const { cart, totalItems, totalPrice, increaseQuantity, decreaseQuantity, removeFromCart, clearCart } =
    useCartStore();
  const navigation = useNavigation();

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert("Your cart is empty!");
      return;
    }

    // Example: redirect to checkout screen
    navigation.navigate("Checkout");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons
          name="arrow-back"
          size={24}
          color="white"
          onPress={() => navigation.goBack()}
        />
        <Text style={styles.headerTitle}>Your Cart</Text>
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyText}>Your cart is empty</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            keyExtractor={(item) => item._id.toString()}
            renderItem={({ item }) => (
              <View style={styles.itemCard}>
                <Image
                  source={{ uri: item.image }}
                  style={styles.image}
                  resizeMode="cover"
                />
                <View style={styles.infoContainer}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.price}>Rs {item.price}</Text>
                  <View style={styles.qtyContainer}>
                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => decreaseQuantity(item._id)}
                    >
                      <Ionicons name="remove" size={18} color="white" />
                    </TouchableOpacity>
              
                    <Text style={styles.qtyText}>{item.quantity}</Text>

                    <TouchableOpacity
                      style={styles.qtyBtn}
                      onPress={() => increaseQuantity(item._id)}
                    >
                      <Ionicons name="add" size={18} color="white" />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.removeBtn}
                  onPress={() => removeFromCart(item._id)}
                >
                  <Ionicons name="trash-outline" size={22} color="red" />
                </TouchableOpacity>
              </View>
            )}
          />

          <View style={styles.footer}>
            <View>
              <Text style={styles.totalItems}>Items: {totalItems}</Text>
              <Text style={styles.totalPrice}>Total: Rs {totalPrice}</Text>
            </View>

            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
};

export default ViewCart;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    height: 100,
    backgroundColor: "blue",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 15,
  },
  headerTitle: {
    color: "white",
    fontSize: 20,
    fontWeight: "600",
  },
  itemCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    marginHorizontal: 10,
    marginVertical: 6,
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 10,
  },
  infoContainer: {
    flex: 1,
    marginLeft: 15,
  },
  name: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
  },
  price: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#555",
    marginVertical: 5,
  },
  qtyContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  qtyBtn: {
    backgroundColor: "blue",
    borderRadius: 20,
    width: 25,
    height: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: {
    fontWeight: "bold",
    color: "#333",
  },
  removeBtn: {
    marginLeft: 10,
  },
  footer: {
    backgroundColor: "#fff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderTopWidth: 1,
    borderColor: "#ddd",
  },
  totalItems: {
    color: "#444",
    fontSize: 13,
  },
  totalPrice: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#222",
  },
  checkoutBtn: {
    backgroundColor: "blue",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 30,
  },
  checkoutText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    color: "#999",
    fontSize: 16,
    marginTop: 10,
  },
});
