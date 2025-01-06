import axios from 'axios';
import { API_URL } from '@env';

const instance = axios.create({
  baseURL: API_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default instance;
