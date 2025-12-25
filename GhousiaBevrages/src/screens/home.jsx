import React, { useEffect, useRef, useState } from "react";
import {
    StyleSheet,
  Text,
  View,
  ActivityIndicator,
  Image,
  FlatList,
  TouchableOpacity,
  Animated,
  Dimensions,
  ScrollView,
  PanResponder,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import useProductStore from "../store/productstore";
import { useNavigation } from '@react-navigation/native';
const { width } = Dimensions.get("window");
const MENU_WIDTH = width * 0.7;

const Home = () => {
  const navigation = useNavigation();
  const [showMenu, setShowMenu] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDisabled, setIsDisabled] = useState(false);

  const scrollX = useRef(new Animated.Value(0)).current;
  const scrollRef = useRef(null);
  const slideX = useRef(new Animated.Value(-MENU_WIDTH)).current;

  const {
    banner: bannerFromStore,
    fetchBanner,
    categories,
    fetchCategories,
    loading,
    error,
    brands,
    fetchBrands,
  } = useProductStore();

  useEffect(() => {
    fetchCategories();
    fetchBrands();
    fetchBanner();
  }, [fetchCategories, fetchBrands, fetchBanner]);

  // auto slide banner
  useEffect(() => {
    if (!bannerFromStore || bannerFromStore.length === 0) return;
    const interval = setInterval(() => {
      const next = (currentIndex + 1) % bannerFromStore.length;
      setCurrentIndex(next);
      scrollRef.current?.scrollTo({
        x: next * width,
        animated: true,
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [currentIndex, bannerFromStore]);

  const showMenuFully = () => {
    setShowMenu(true);
    setIsDisabled(true);
    Animated.timing(slideX, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const hideMenu = () => {
    Animated.timing(slideX, {
      toValue: -MENU_WIDTH,
      duration: 150,
      useNativeDriver: true,
    }).start(() => {
      setShowMenu(false);
      setIsDisabled(false);
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 10,
      onPanResponderMove: (_, gesture) => {
        if (gesture.dx < 0) {
          // gesture.dx negative: convert to slideX value
          slideX.setValue(Math.max(-MENU_WIDTH, -MENU_WIDTH + gesture.dx));
        }
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx < -80) hideMenu();
        else showMenuFully();
      },
    })
  ).current;

  const handleScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { x: scrollX } } }],
    { useNativeDriver: true }
  );

  let mainContent;
  if (loading) {
    mainContent = <ActivityIndicator size="large" style={styles.loader} />;
  } else if (error) {
    mainContent = <Text style={styles.error}>{error}</Text>;
  } else {
    mainContent = (
      <>
        <View style={styles.header}>
          <TouchableOpacity onPress={showMenuFully}>
            <Ionicons name="menu" size={32} color="white" />
          </TouchableOpacity>
          <View style={{ marginLeft: 12 }}>
            <Text style={{ color: "white", fontWeight: "600" }}>Our Location</Text>
            <Text style={{ color: "white" }}>Location</Text>
          </View>
        </View>

        <Animated.View
          pointerEvents={showMenu ? "none" : "auto"}
          style={{ flex: 1, opacity: showMenu ? 0.4 : 1 }}
        >
          <FlatList
            ListHeaderComponent={
              <>
                {/* Search Bar */}
                <TouchableOpacity
                  style={styles.searchMain}
                  onPress={() => navigation.navigate("Search")}
                >
                  <View style={styles.searchContainer}>
                    <Ionicons name="search" size={20} color="#555" />
                    <View style={styles.searchInput}>
                      <Text style={{ padding: 10 }}>Search</Text>
                    </View>
                  </View>
                </TouchableOpacity>

                {/* Banner */}
                <View style={styles.bannerWrapper}>
                  <Animated.ScrollView
                    ref={scrollRef}
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={16}
                    onScroll={handleScroll}
                    onMomentumScrollEnd={(e) => {
                      const newIndex = Math.round(
                        e.nativeEvent.contentOffset.x / width
                      );
                      setCurrentIndex(newIndex);
                    }}
                  >
                    {(bannerFromStore || []).map((item, i) => {
                      // safe uri for banner
                      let uri = "";
                      if (item && item.image) {
                        if (typeof item.image === "string") uri = item.image;
                        else if (item.image.url && typeof item.image.url === "string")
                          uri = item.image.url;
                      }

                      return (
                        <Animated.View
                          key={i}
                          pointerEvents={isDisabled ? "none" : "auto"}
                          style={{
                            width,
                            justifyContent: "center",
                            alignItems: "center",
                            opacity: scrollX.interpolate({
                              inputRange: [
                                (i - 1) * width,
                                i * width,
                                (i + 1) * width,
                              ],
                              outputRange: [0.7, 1, 0.7],
                              extrapolate: "clamp",
                            }),
                            transform: [
                              {
                                scale: scrollX.interpolate({
                                  inputRange: [
                                    (i - 1) * width,
                                    i * width,
                                    (i + 1) * width,
                                  ],
                                  outputRange: [0.9, 1, 0.9],
                                  extrapolate: "clamp",
                                }),
                              },
                            ],
                          }}
                        >
                          {uri ? (
                            <Image
                              source={{ uri }}
                              style={styles.banner}
                              resizeMode="cover"
                            />
                          ) : (
                            <View
                              style={[
                                styles.banner,
                                {
                                  backgroundColor: "#eee",
                                  justifyContent: "center",
                                  alignItems: "center",
                                },
                              ]}
                            >
                              <Text>No image</Text>
                            </View>
                          )}
                        </Animated.View>
                      );
                    })}
                  </Animated.ScrollView>

                  {/* Dots */}
                  <View style={styles.dotsContainer}>
                    {(bannerFromStore || []).map((_, i) => (
                      <View
                        key={i}
                        style={[
                          styles.dot,
                          currentIndex === i && styles.activeDot,
                        ]}
                      />
                    ))}
                  </View>
                </View>
              
                <Text style={styles.heading}>Drinks & Grocery Essentials</Text>
              </>
            }
              data={Array.isArray(categories) ? categories : []}
              keyExtractor={(item) =>
              item._id?.toString() || item.name || Math.random().toString()
            }
            numColumns={2}
            columnWrapperStyle={{
              justifyContent: "space-between",
              paddingHorizontal: 12,
            }}
            renderItem={({ item }) => {
              let catUri = "";
              if (item && item.image) {
                if (typeof item.image === "string") catUri = item.image;
                else if (item.image.url && typeof item.image.url === "string")
                  catUri = item.image.url;
              }

              return (
                <TouchableOpacity
                  style={styles.card}
                  onPress={() =>
                    navigation.navigate("Categories", {
                      categoryId: item._id,
                    })
                  }
                >
                  <Image
                    source={{ uri: catUri || "https://via.placeholder.com/150" }}
                    style={styles.image}/>
                  <Text style={styles.name}>{item.name}</Text>
                </TouchableOpacity>
              );
            }}
            ListFooterComponent={
              <>
                <Text style={styles.brandsheading}>Shop Brands</Text>
                <FlatList
                  data={Array.isArray(brands) ? brands : []}
                  numColumns={2}
                  keyExtractor={(item) =>
                    item._id?.toString() || item.name || Math.random().toString()
                  }
                  columnWrapperStyle={{
                    justifyContent: "space-between",
                    paddingHorizontal: 12,
                  }}
                  renderItem={({ item }) => {
                    let brandUri2 = "";
                    if (item && item.image) {
                      if (typeof item.image === "string") brandUri2 = item.image;
                      else if (
                        item.image.url &&
                        typeof item.image.url === "string"
                      )
                        brandUri2 = item.image.url;
                    }

                    return (
                      <TouchableOpacity
                        style={styles.brandcard}
                        onPress={() =>
                          navigation.navigate("Categories", {
                            brandId: item._id,
                          })
                        }
                      >
                        <Image
                          source={{
                            uri: brandUri2 || "https://via.placeholder.com/150",
                          }}
                          style={styles.brandImage}
                        />
                        <Text style={styles.name}>{item.name}</Text>
                      </TouchableOpacity>
                    );
                  }}
                  contentContainerStyle={{ paddingBottom: 60 }}
                />
              </>
            }
          />
        </Animated.View>
      </>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", position: "relative" }}>
      {/* Overlay */}
      <Animated.View
        pointerEvents={showMenu ? "auto" : "none"}
        style={[
          styles.overlay,
          {
            opacity: slideX.interpolate({
              inputRange: [-MENU_WIDTH, 0],
              outputRange: [0, 0.6],
              extrapolate: "clamp",
            }),
          },
        ]}
      >
        <TouchableOpacity style={{ flex: 1 }} onPress={hideMenu} />
      </Animated.View>

      {/* Side Menu */}
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          styles.menucontainer,
          { transform: [{ translateX: slideX }] },
        ]}
      >
        <TouchableOpacity onPress={hideMenu} style={styles.closeBtn}>
          <Ionicons name="close" size={28} />
        </TouchableOpacity>
        <View style={styles.menucontentmaincon}>
          <View style={styles.menucontentcon}>
            <Ionicons style={styles.menuicons} size={22} name="person-outline" />
            <Text style={styles.menucontent}>Profile</Text>
          </View>

          <TouchableOpacity onPress={()=>{
            navigation.navigate("Orders");

          }} style={styles.menucontentcon}>
            <Ionicons style={styles.menuicons} size={22} name="cart-outline" />
            <Text style={styles.menucontent}>Your Orders</Text>
          </TouchableOpacity>

          <View style={styles.menucontentcon}>
            <Ionicons style={styles.menuicons} size={22} name="location" />
            <Text style={styles.menucontent}>Your Address</Text>
          </View>

          <View style={styles.menucontentcon}>
            <Ionicons style={styles.menuicons} size={22} name="wallet-outline" />
            <Text style={styles.menucontent}>Wallet</Text>
          </View>

          <View style={styles.menucontentcon}>
            <Ionicons style={styles.menuicons} size={22} name="ticket-outline" />
            <Text style={styles.menucontent}>Voucher</Text>
          </View>

          <View style={styles.menucontentcon}>
            <Ionicons style={styles.menuicons} size={22} name="card-outline" />
            <Text style={styles.menucontent}>Payment Methods</Text>
          </View>

          <View
            style={[styles.menucontentcon, { borderTopWidth: 1, borderTopColor: "#eee" }]}
          >
            <Ionicons style={styles.menuicons} size={22} name="shield-outline" />
            <Text style={styles.menucontent}>Privacy & Policy</Text>
          </View>

          <View style={styles.menucontentcon}>
            <Ionicons style={styles.menuicons} size={22} name="document-text-outline" />
            <Text style={styles.menucontent}>Terms & Conditions</Text>
          </View>
        </View>
      </Animated.View>

      {mainContent}
    </View>
  );
};

export default Home;

const styles = StyleSheet.create({
  menucontainer: {
    zIndex: 100,
    position: "absolute",
    top: 0,
    height: "100%",
    width: "70%",
    backgroundColor: "white",
    left: 0,
    paddingTop: 40,
    paddingHorizontal: 10,
    elevation: 10,
  },
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "black",
    zIndex: 90,
  },
  logo: {
    width: "70%",
    height: 120,
    alignSelf: "center",
    resizeMode: "contain",
  },
  menuicons: {
    fontWeight: "900",
  },
  closeBtn: {
    position: "absolute",
    right: 10,
    top: 40,
    zIndex: 110,
  },
  header: {
    height: 100,
    backgroundColor: "blue",
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    paddingBottom: 10,
    paddingLeft: 20,
  },
  searchMain: {
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 30,
    paddingHorizontal: 10,
  },
  menucontentmaincon: {
    flex: 1,
    display: "flex",
    marginTop: 160,
    flexDirection: "column",
  },
  menucontentcon: {
    width: "100%",
    height: 50,
    flexDirection: "row",
    gap: 10,
    marginVertical: 1,
    paddingLeft: 20,
    alignItems: "center",
  },
  menucontent: {
    fontSize: 14,
    fontWeight: "bold",
  },
  searchInput: {
    flex: 1,
    marginLeft: 6,
  },
  bannerWrapper: {
    width: "100%",
    height: 200,
    overflow: "hidden",
  },
  banner: {
    width: width,
    height: "100%",
  },
  dotsContainer: {
    position: "absolute",
    bottom: 10,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
  },
  dot: {
    height: 8,
    width: 8,
    backgroundColor: "#fff",
    borderRadius: 50,
    marginHorizontal: 4,
    opacity: 0.6,
  },
  activeDot: {
    width: 10,
    height: 10,
    backgroundColor: "#9b9b9b",
    opacity: 1,
  },
  heading: {
    marginTop: 20,
    paddingHorizontal: 20,
    fontSize: 15,
    fontWeight: "bold",
  },
  sectionHeading: {
    marginTop: 20,
    paddingHorizontal: 20,
    fontSize: 15,
    fontWeight: "bold",
  },
  brandsheading: {
    marginTop: 20,
    paddingHorizontal: 20,
    fontSize: 15,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#f3f3f3",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    width: "48%",
    height: 130,
    marginVertical: 8,
  },
  image: {
    width: "80%",
    height: 80,
    resizeMode: "contain",
    marginBottom: 8,
  },
  brandcard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    width: "48%",
    height: 130,
    marginVertical: 8,
    elevation: 3,
    borderWidth: 0.5,
    borderColor: "#ddd",
  },
  brandImage: {
    width: "80%",
    height: 80,
    resizeMode: "contain",
    marginBottom: 8,
  },
  brandCard: {
    backgroundColor: "#f8f8f8",
    width: 90,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  brandImage: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
  brandText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 5,
  },
  name: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  loader: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: 20,
  },
});
