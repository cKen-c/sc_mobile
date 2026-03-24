import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const client = axios.create({
  baseURL: 'http://127.0.0.1:8000/api',
  timeout: 10000,
});

client.interceptors.request.use(async (config) => {
  console.log('=== REQUETE ===', config.method, config.baseURL + config.url);
  console.log('=== BODY ===', JSON.stringify(config.data));
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;