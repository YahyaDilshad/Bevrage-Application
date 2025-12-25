import { TextInput, StyleSheet, Text, View, TouchableOpacity, FlatList, Image, ScrollView, Animated } from 'react-native';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import useProductStore from '../store/productstore';
import Ionicons from "react-native-vector-icons/Ionicons";
import useCartStore from '../store/cartstore';
import { useNavigation } from '@react-navigation/native';

const Search = () => {
  const navigation = useNavigation();
  const { products, fetchProducts, brands, fetchBrands } = useProductStore();
  const [input, setInput] = useState('');
  const [isDisabled, setIsDisabled] = useState(false);
  const [itemShowcase, setitemShowcase] = useState(null);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const {
    cart,
    addToCart,
    decreaseQuantity,
    increaseQuantity,
    totalItems,
    totalPrice,
  } = useCartStore();

  useEffect(() => {
    fetchBrands();
    fetchProducts({});
  }, []);

  const increment = (item) => {
    const exists = cart.find((p) => p._id === item._id);
    if (exists) increaseQuantity(item._id);
    else addToCart(item);
  };

  const decrement = (item) => {
    decreaseQuantity(item._id);
  };

  const showItemShowcase = (item) => {
    setitemShowcase(item);
    setIsDisabled(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  const hideItemShowcase = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setitemShowcase(null);
      setIsDisabled(false);
    });
  };

  const filteredProducts = useMemo(() => {
    if (!input.trim()) return [];
    const searchLower = input.toLowerCase();
    return products.filter((p) =>
      p.name?.toLowerCase().includes(searchLower) ||
      p.description?.toLowerCase().includes(searchLower) ||
      p.category?.name?.toLowerCase().includes(searchLower)
    );
  }, [input, products]);

  return (
    <View style={styles.container}>
      <View style={styles.overlay}></View>
      <View style={styles.searchContainer}>
        <View style={styles.search}>
          <Ionicons name="search" size={20} color="#555" />
          <TextInput
            value={input}
            onChangeText={(text) => setInput(text)}
            placeholder="Search Items..."
            style={styles.input}
          />
        </View>
      </View>

      <View style={styles.contentContainer}>
        {input.trim() && filteredProducts.length > 0 && (
          <View style={styles.cardContainer}>
            <Text style={styles.showresultlength}>{filteredProducts.length} Results Shows</Text>
            <FlatList
              data={filteredProducts}
              showsVerticalScrollIndicator={false}
              keyExtractor={(item) => item._id?.toString()}
              scrollEnabled={!isDisabled}
              renderItem={({ item }) => {
                const quantity = cart.find((p) => p._id === item._id)?.quantity || 0;
                return (
                  <TouchableOpacity
                    onPress={() => showItemShowcase(item)}
                    activeOpacity={0.8}
                    style={styles.card}
                    disabled={isDisabled}
                  >
                    <View style={styles.imageContainer}>
                      <Image
                        source={{ uri: item.image || 'https://via.placeholder.com/150' }}
                        style={styles.image}
                        resizeMode="cover"
                      />
                    </View>
                    <View style={styles.cardcontent}>
                      <Text style={styles.name}>{item.name}</Text>
                      <Text style={styles.price}>Rs {item.price}</Text>
                         <View style={styles.addContainer}>
                      <View
                        style={[
                          styles.add,
                          { width: quantity > 0 ? 130 : 50 },
                        ]}
                      >
                        {quantity > 0 && (
                          <Ionicons
                            onPress={() => decrement(item)}
                            style={styles.removeIcon}
                            name="remove"
                            size={22}
                            color="white"
                          />
                        )}
                        {quantity > 0 && (
                          <Text style={styles.counter}>{quantity}</Text>
                        )}
                        <Ionicons
                          onPress={() => increment(item)}
                          style={styles.addIcon}
                          name="add"
                          size={22}
                          color="white"
                        />
                      </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              }}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  No products found
                </Text>
              }
            />
          </View>
        )}
        {input.trim() && filteredProducts.length === 0 && (
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsText}>No products found matching "{input}"</Text>
          </View>
        )}

        {!input.trim() && (
          <>
            <Text style={styles.heading}>Popular Brands</Text>
            <View style={styles.brandContainer}>
              {brands.map((brand, idx) => (
                <TouchableOpacity
                  onPress={() => {
                    
                    navigation.navigate("Categories", {
                      brandId: brand._id,
                    });
                  }}
                  key={brand._id ? brand._id.toString() : `brand-${idx}`}
                  style={styles.brandData}
                >
                  <Text style={styles.brandName}>{brand.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}

        {itemShowcase && (
          <View style={{
             flex: 1,
             height: '100%',        
             backgroundColor : itemShowcase ? "#0000008E" : "transparent",
             position: "absolute",
             bottom: 0,
             left: 0,
             right: 0,
        
          }}>
           <Animated.View
              style={[
                styles.showcaseContainer,
                {
                  transform: [
                    {
                      translateY: slideAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [400, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
            <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity onPress={hideItemShowcase} style={styles.closeBtn}>
                <Ionicons name="close" size={30} />
            </TouchableOpacity>
                <Image
                  source={{ uri: itemShowcase.image }}
                  style={styles.showImage}
                />
                <Text style={styles.showName}>{itemShowcase.name}</Text>
                <Text style={styles.showPrice}>Rs {itemShowcase.price}</Text>
                <Text style={styles.showDetail}>Detail Item</Text>
              </ScrollView>
            </Animated.View>
          </View>
        )}
      </View>
      {/* Go To Cart Button */}
       {totalItems > 0 && (
         <TouchableOpacity
           onPress={() => navigation.navigate("Cart")}
           style={styles.gotocardcontainer}
           disabled={isDisabled}
         >
           <View style={styles.gotocard}>
             <Text style={styles.collectedOrder}>{totalItems}</Text>
             <Text style={styles.Viewcart}>View Cart</Text>
             <Text style={styles.OrderPrice}>Rs {totalPrice}</Text>
           </View>
         </TouchableOpacity>
       )}
    </View>
  );
};

export default Search;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  overlay: {
    width: '100%',
    height: 40,
    backgroundColor: 'blue',
  },
  searchContainer: {
    paddingTop: 30,
    paddingHorizontal: 10,
  },
  search: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 30,
    paddingHorizontal: 10,
    fontSize: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    marginLeft: 10,
  },
  contentContainer: {
    padding : 10,
    flex: 1
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  brandContainer: {
    marginTop: 10,
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  brandData: {
    flexDirection: 'column',
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 50,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginVertical: 5,
    alignSelf: 'flex-start',
  },
  brandName: {
    fontSize: 16,
    color: '#ccc',
  },
  cardContainer: {
    marginVertical: 10,
  },
  card: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    backgroundColor : "#fff"
  },
  imageContainer: {
    width: 100,
    height: 100,
    marginRight: 10,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  price: {
    fontSize: 14,
    color: 'green',
    fontWeight: 'bold',
  },
  addContainer:{
    display : 'flex',
    alignItems : 'flex-end',
  },
  add: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent : 'space-between',
    backgroundColor: 'blue',
    borderRadius: 15,
    marginTop: 10,
    padding: 5,
  },
  removeIcon: {
    marginRight: 10,
  },
  addIcon: {
    marginLeft: 10,
  },
  counter: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 30,
    fontSize: 16,
    color: '#999',
  },
  cardcontent:{
   marginTop : 10,
   flex : 1,
   flexDirection : 'column',

  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  closeBtn: {
    position: 'absolute',
    left: '43%',
    top: '20%',
    padding: 10,
    borderRadius: 50,
    backgroundColor: '#fff',
    marginTop: 10,
  },
  showcaseContainer: {
    height: 400,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0, 
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    elevation: 15,
    zIndex: 100,
  },
  showImage: {
    width: 200,
    height: 200,
    borderRadius: 10,
    alignSelf: 'center',
    marginVertical: 10,
  },
  showName: {
    fontSize: 16,
    fontWeight: '600',
  },
  showDetail: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 20,
  },
  showPrice: {
    color: 'green',
    fontWeight: 'bold',
    marginVertical: 5,
  },
  showresultlength :{
    fontWeight : 'bold',
    fontSize : 20,
    marginBottom : 10
  },
  gotocardcontainer: {
    height: 50,
    bottom: 20,
    backgroundColor: "white",
    paddingHorizontal: 10,
  },
  gotocard: {
    borderRadius: 50,
    width: "100%",
    padding: 15,
    backgroundColor: "blue",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  collectedOrder: {
    color: "white",
    marginLeft: 10,
  },
  Viewcart: {
    color: "white",
    fontWeight: "bold",
  },
  OrderPrice: {
    fontWeight: "bold",
    color: "white",
  },
});