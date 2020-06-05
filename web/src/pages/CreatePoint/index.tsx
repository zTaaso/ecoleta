import React, { useState, useEffect, ChangeEvent } from 'react';
import { Link } from 'react-router-dom';
import { Map, TileLayer, Marker } from 'react-leaflet';
import axios from 'axios';
import { LeafletMouseEvent } from 'leaflet';
import { FiArrowLeft } from 'react-icons/fi';

import api from '../../services/api';
import logo from '../../assets/logo.svg';
import './styles.css';

interface CollectItems {
  id: number;
  image: string;
  title: string;
  url: string;
}

interface Ufs {
  name: string;
  initials: string;
}

interface IBGEUFResponse {
  nome: string;
  sigla: string;
}
interface IBGECityResponse {
  nome: string;
}

const CreatePoint: React.FC = () => {
  const [location, setLocation] = useState<[number, number]>([0, 0]);

  const [collectItems, setCollectItems] = useState<CollectItems[]>([]);
  const [ufs, setUfs] = useState<Ufs[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [selectedUf, setSelectedUf] = useState('0');
  const [selectedCity, setSelectedCity] = useState('0');
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    whatsapp: '',
  });

  async function getCollectItems() {
    const response = await api.get('/items');
    setCollectItems(response.data);
  }

  function handleMapClick(evt: LeafletMouseEvent) {
    setLocation([evt.latlng.lat, evt.latlng.lng]);
  }

  function handleSelectUf(evt: ChangeEvent<HTMLSelectElement>) {
    setSelectedUf(evt.target.value);
  }

  function handleSelectCity(evt: ChangeEvent<HTMLSelectElement>) {
    setSelectedCity(evt.target.value);
  }

  function handleSelectItem(id: number) {
    const itemExists = selectedItems.findIndex((i) => i === id);

    if (itemExists >= 0) {
      const filteredItems = selectedItems.filter((i) => i !== id);
      setSelectedItems(filteredItems);
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  }

  function handleInputChange(evt: ChangeEvent<HTMLInputElement>) {
    const { name, value } = evt.target;

    setFormData({ ...formData, [name]: value });
  }

  async function handleSubmit(evt: ChangeEvent<HTMLFormElement>) {
    evt.preventDefault();

    const data = {
      ...formData,
      image: 'meucú',
      latitude: location[0],
      longitude: location[1],
      city: selectedCity,
      uf: selectedUf,
      items: selectedItems,
    };

    const response = await api.post('/points', data);
    console.log(response);
  }

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation([pos.coords.latitude, pos.coords.longitude]);
    });
    getCollectItems();
  }, []);

  useEffect(() => {
    axios
      .get<IBGEUFResponse[]>(
        'https://servicodados.ibge.gov.br/api/v1/localidades/estados',
        {
          params: {
            orderBy: 'nome',
          },
        }
      )
      .then((response) => {
        const ufNames = response.data.map((uf) => ({
          name: uf.nome,
          initials: uf.sigla,
        }));
        setUfs(ufNames);
      });
  }, []);

  useEffect(() => {
    if (selectedUf === '0') {
      return;
    }

    axios
      .get<IBGECityResponse[]>(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`
      )
      .then((response) => {
        const cityNames = response.data.map((city) => city.nome);
        setCities(cityNames);
      });
  }, [selectedUf]);

  return (
    <div id="page-create-point">
      <header>
        <img src={logo} alt="Ecoleta" />
        <Link to="/">
          <FiArrowLeft />
          Voltar para home
        </Link>
      </header>

      <form onSubmit={handleSubmit}>
        <h1>
          Cadastro do <br /> ponto de coleta
        </h1>

        <fieldset>
          <legend>
            <h2>Sobre</h2>
          </legend>

          <div className="field">
            <label htmlFor="name">Nome da entidade</label>
            <input
              type="text"
              name="name"
              id="name"
              required
              onChange={handleInputChange}
            />
          </div>

          <div className="field-group">
            <div className="field">
              <label htmlFor="email">E-mail</label>
              <input
                type="email"
                name="email"
                id="email"
                required
                onChange={handleInputChange}
              />
            </div>

            <div className="field">
              <label htmlFor="whatsapp">Whatsapp</label>
              <input
                type="number"
                name="whatsapp"
                id="whatsapp"
                required
                onChange={handleInputChange}
              />
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Endereço</h2>
            <span>Selecione o endereço no mapa</span>
          </legend>

          <Map center={location} zoom={15} onclick={handleMapClick}>
            <TileLayer
              attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={location} />
          </Map>

          <div className="field-group">
            <div className="field">
              <label htmlFor="uf">Estado (UF)</label>
              <select
                name="uf"
                id="uf"
                value={selectedUf}
                onChange={handleSelectUf}
              >
                <option value="0">Selecione uma UF</option>
                {ufs.map((uf) => (
                  <option key={uf.initials} value={uf.initials}>
                    {uf.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label htmlFor="city">Cidade</label>
              <select
                name="city"
                id="city"
                onChange={handleSelectCity}
                value={selectedCity}
              >
                <option value="0">Selecione uma cidade</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </fieldset>

        <fieldset>
          <legend>
            <h2>Ítens de coleta</h2>
            <span>Selecione um ou mais ítens abaixo</span>
          </legend>

          <ul className="items-grid">
            {collectItems.map((item) => (
              <li
                key={item.id}
                onClick={() => handleSelectItem(item.id)}
                className={selectedItems.includes(item.id) ? 'selected' : ''}
              >
                <img src={item.url} alt={item.title} />
                <span>{item.title}</span>
              </li>
            ))}
          </ul>
        </fieldset>

        <button type="submit">Cadastrar ponto de coleta</button>
      </form>
    </div>
  );
};

export default CreatePoint;
