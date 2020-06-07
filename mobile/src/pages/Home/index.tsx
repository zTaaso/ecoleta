import React, { useState, useEffect } from 'react';
import { View, Image, Text, ImageBackground, Alert } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { useNavigation } from '@react-navigation/native';
import { Feather as Icon } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';

import styles from './styles';
import api from '../../services/api';

interface IBGEUFResponse {
  sigla: string;
  nome: string;
}
interface IBGECityResponse {
  nome: string;
}

interface Uf {
  initials: string;
  name: string;
}

const Home: React.FC = () => {
  const [ufs, setUfs] = useState<Uf[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('');

  const navigation = useNavigation();

  function handleNavigateToPoints() {
    if (selectedUf === '0' || selectedCity === '0') {
      return Alert.alert('Oops!', 'Preencha os campos corretamente!');
    }

    navigation.navigate('Points', {
      selectedUf,
      selectedCity,
    });
  }

  useEffect(() => {
    api
      .get<IBGEUFResponse[]>(
        'https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome'
      )
      .then((response) => {
        const serializedUfs = response.data.map((uf) => ({
          initials: uf.sigla,
          name: uf.nome,
        }));
        setUfs(serializedUfs);
      });
  }, []);

  useEffect(() => {
    if (selectedUf === '0') {
      setSelectedCity('0');
      return;
    }
    api
      .get<IBGECityResponse[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios
    `
      )
      .then((response) => {
        const serializedCities = response.data.map((city) => city.nome);
        setCities(serializedCities);
      });
  }, [selectedUf]);

  return (
    <ImageBackground
      style={styles.container}
      source={require('../../assets/home-background.png')}
      imageStyle={{ width: 274, height: 368 }}
    >
      <View style={styles.main}>
        <Image source={require('../../assets/logo.png')} />

        <Text style={styles.title}>Seu marketplace de coleta de resíduos</Text>
        <Text style={styles.description}>
          Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente.
        </Text>
      </View>

      <RNPickerSelect
        onValueChange={(value) => setSelectedUf(value)}
        value={selectedUf}
        placeholder={{ label: 'Selecione uma UF', value: '0' }}
        items={ufs.map((uf) => ({
          label: uf.name,
          value: uf.initials,
        }))}
      />

      <RNPickerSelect
        onValueChange={(val) => setSelectedCity(val)}
        value={selectedCity}
        placeholder={{ label: 'Selecione uma Cidade', value: 0 }}
        items={cities.map((city) => ({
          label: city,
          value: city,
        }))}
      />

      <View style={styles.footer}>
        <RectButton style={styles.button} onPress={handleNavigateToPoints}>
          <View style={styles.buttonIcon}>
            <Text>
              <Icon name="arrow-right" color="#FFF" size={24} />
            </Text>
          </View>
          <Text style={styles.buttonText}>Entrar</Text>
        </RectButton>
      </View>
    </ImageBackground>
  );
};

export default Home;
