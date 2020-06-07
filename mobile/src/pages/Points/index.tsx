import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { SvgUri } from 'react-native-svg';

import api from '../../services/api';
import styles from './styles';

interface HTTPResponseItems {
  id: number;
  title: string;
  url: string;
}
interface Item {
  id: number;
  title: string;
  image_url: string;
}

interface Point {
  id: number;
  image: string;
  name: string;
  latitude: number;
  longitude: number;
}

interface RouteParams {
  selectedUf: string;
  selectedCity: string;
}

const Points = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { selectedUf, selectedCity } = route.params as RouteParams;

  const [items, setItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [points, setPoints] = useState<Point[]>([]);
  const [initialLocation, setInitialLocation] = useState<[number, number]>([
    0,
    0,
  ]);

  function handleNavigateBack() {
    navigation.goBack();
  }

  function handleNavigateToDetail(id: number) {
    navigation.navigate('Detail', { pointId: id });
  }

  function handleSelectItem(id: number) {
    const itemExists = selectedItems.findIndex((item) => item === id);

    if (itemExists >= 0) {
      const newSelectedItems = selectedItems.filter((item) => item !== id);
      setSelectedItems(newSelectedItems);
      return;
    }

    setSelectedItems([...selectedItems, id]);
  }

  useEffect(() => {
    async function getItems() {
      const response = await api.get<HTTPResponseItems[]>('items');

      const serializedItems = response.data.map((i) => ({
        id: i.id,
        title: i.title,
        image_url: i.url,
      }));

      setItems(serializedItems);
    }
    getItems();
  }, []);

  useEffect(() => {
    async function getLocation() {
      const { status } = await Location.requestPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert('Oops!', 'Não temos acesso a sua localização.');
        return;
      }

      const { coords } = await Location.getCurrentPositionAsync();
      setInitialLocation([coords.latitude, coords.longitude]);
    }
    getLocation();
  }, []);

  useEffect(() => {
    api
      .get<Point[]>('points', {
        params: {
          uf: selectedUf,
          city: selectedCity,
          items: selectedItems,
        },
      })
      .then((response) => {
        setPoints(response.data);
      });
  }, [selectedItems]);

  return (
    <>
      <View style={styles.container}>
        <TouchableOpacity onPress={handleNavigateBack}>
          <Icon name="arrow-left" size={20} color="#34cb79" />
        </TouchableOpacity>

        <Text style={styles.title}>Bem vindo.</Text>
        <Text style={styles.description}>
          Encontre no mapa um ponto de coleta.
        </Text>

        <View style={styles.mapContainer}>
          {initialLocation[1] !== 0 && (
            <MapView
              style={styles.map}
              initialRegion={{
                latitude: initialLocation[0],
                longitude: initialLocation[1],
                latitudeDelta: 0.014,
                longitudeDelta: 0.014,
              }}
            >
              {points.map((point) => (
                <Marker
                  key={point.id}
                  coordinate={{
                    latitude: point.latitude,
                    longitude: point.longitude,
                  }}
                  onPress={() => handleNavigateToDetail(point.id)}
                >
                  <View style={styles.mapMarkerContainer}>
                    <Image
                      source={{
                        uri: point.image,
                      }}
                      style={styles.mapMarkerImage}
                    />
                    <Text style={styles.mapMarkerTitle}>{point.name}</Text>
                  </View>
                </Marker>
              ))}
            </MapView>
          )}
        </View>
      </View>

      <View style={styles.itemsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20 }}
        >
          {items.map((item) => (
            <TouchableOpacity
              key={item.image_url}
              style={[
                styles.item,
                selectedItems.includes(item.id) ? styles.selectedItem : {},
              ]}
              onPress={() => handleSelectItem(item.id)}
              activeOpacity={0.5}
            >
              <SvgUri width={42} height={42} uri={item.image_url} />
              <Text style={styles.itemTitle}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </>
  );
};

export default Points;
