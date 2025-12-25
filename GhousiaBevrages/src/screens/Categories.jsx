import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  StyleSheet,
  Animated,
  ScrollView,
} from "react-native";
import useProductStore from "../store/productstore";
import Ionicons from "react-native-vector-icons/Ionicons";
import useCartStore from "../store/cartstore";
import { useNavigation, useRoute } from "@react-navigation/native";

const CategoryPage = () => {
  
  const navigation = useNavigation();
  const route = useRoute()
  const { categoryId, brandId, productId } = route.params || {};

  const {
    categories,
    fetchCategories,
    fetchProducts,
    products,
    loading,
    error,
    fetchBrands,
    brands,
  } = useProductStore();

  const {
    cart,
    addToCart,
    decreaseQuantity,
    increaseQuantity,
    totalItems,
    totalPrice,
  } = useCartStore();


  const [itemshowcase, setitemshowcase] = useState(null);
  const [isDisabled, setIsDisabled] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  const [selectedCategory, setSelectedCategory] = useState(categoryId || "");
  const [selectedBrand, setSelectedBrand] = useState(brandId || "");

  // Show item detail bottom sheet
  const showItemShowcase = (item) => {
    setitemshowcase(item);
    setIsDisabled(true);
    Animated.timing(slideAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  // Hide item detail bottom sheet
  const hideItemShowcase = () => {
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setitemshowcase(null);
      setIsDisabled(false);
    });
  };

  useEffect(() => {
    fetchCategories();
    fetchBrands();

    if (categoryId) {
      fetchProducts({ category: categoryId });
    } else if (brandId) {
      fetchProducts({ brand: brandId });
    } else if (productId) {
      fetchProducts({ id: productId });
    } else {
      fetchProducts({});
    }
  }, [categoryId, brandId, productId]);

  const increament = (item) => {
    const exists = cart.find((p) => p._id === item._id);
    if (exists) increaseQuantity(item._id);
    else addToCart(item);
  };

  const decreament = (item) => {
    decreaseQuantity(item._id);
  };

  if (loading)
    return (
      <ActivityIndicator
        size="large"
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      />
    );

  if (error) return <Text style={styles.error}>{error}</Text>;

  return (
    <View style={[styles.main]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headercategory}>
          <Ionicons
            name="arrow-back"
            size={24}
            color="white"
            onPress={() => navigation.goBack()}
          />
          <Text style={styles.headerTitle}>Categories</Text>
        </View>

        {/* Category Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categorySection}
          scrollEnabled={!isDisabled}
        >
          {categories.map((item) => {
            const isActive = item._id === selectedCategory;
            return (
              <TouchableOpacity
                key={item._id}
                style={[
                  styles.categorydCard,
                  {
                    backgroundColor: isActive ? "#fff" : "transparent",
                    borderWidth: isActive ? 1 : 0,
                  },
                ]}
                onPress={() => {
                  setSelectedCategory(item._id);
                  setSelectedBrand("");
                  fetchProducts({ category: item._id });
                }}
                disabled={isDisabled}
              >
                <Text
                  style={[
                    styles.categoryText,
                    { color: isActive ? "blue" : "#fff" },
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Brand Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.brandSection}
          scrollEnabled={!isDisabled}
        >
          {brands.map((item) => {
            const isActive = item._id === selectedBrand;
            return (
              <TouchableOpacity
                key={item._id}
                style={[
                  styles.brandCard,
                  {
                    backgroundColor: isActive ? "blue" : "#fff",
                  },
                ]}
                onPress={() => {
                  setSelectedBrand(item._id);
                  setSelectedCategory("");
                  fetchProducts({ brand: item._id });
                }}
                disabled={isDisabled}
              >
                <Text
                  style={[
                    styles.brandText,
                    { color: isActive ? "#fff" : "#616161" },
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Product List */}
      <View style={styles.cardcontainer}>
        <FlatList
          data={products}
          keyExtractor={(item) => item._id?.toString()}
          scrollEnabled={!isDisabled}
          renderItem={({ item }) => {
            const quantity =
              cart.find((p) => p._id === item._id)?.quantity || 0;

            return (
              <TouchableOpacity
                onPress={() => showItemShowcase(item)}
                activeOpacity={0.8}
                style={styles.card}
                disabled={isDisabled}
              >
                <View style={styles.imageContainer}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                </View>

                <View style={{ marginTop: 10 }}>
                  <Text style={styles.name}>{item.name}</Text>
                  <Text style={styles.price}>Rs {item.price}</Text>

                  <View
                    style={[
                      styles.addcontainer,
                      { width: quantity > 0 ? 130 : 50 },
                    ]}
                  >
                    {quantity > 0 && (
                      <Ionicons
                        onPress={() => decreament(item)}
                        style={styles.removeicon}
                        name="remove"
                        size={22}
                        color="white"
                      />
                    )}
                    {quantity > 0 && (
                      <Text style={styles.Counter}>{quantity}</Text>
                    )}
                    <Ionicons
                      onPress={() => increament(item)}
                      style={styles.addicon}
                      name="add"
                      size={22}
                      color="white"
                    />
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 30 }}>
              No products found
            </Text>
          }
        />
      </View>

      {/* Bottom Sheet */}
      {itemshowcase && (
        <View
          style={{
            flex: 1,
            height: "100%",
            backgroundColor: itemshowcase ? "#0000008E" : "transparent",
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
          }}
        >
          <TouchableOpacity onPress={hideItemShowcase} style={styles.closeBtn}>
            <Ionicons name="close" size={30} />
          </TouchableOpacity>

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
              <Image
                source={{ uri: itemshowcase.image }}
                style={styles.showImage}
              />
              <Text style={styles.showName}>{itemshowcase.name}</Text>
              <Text style={styles.showPrice}>Rs {itemshowcase.price}</Text>
              <Text style={styles.showDetail}>Detail Item</Text>
            </ScrollView>
          </Animated.View>
        </View>
      )}

      {/* Go To Cart */}
      {totalItems > 0 && (
        <TouchableOpacity
          onPress={() => navigation.navigate("Viewcart")}
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
export default CategoryPage;
const styles = StyleSheet.create({})