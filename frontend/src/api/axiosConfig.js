import axios from 'axios';

// Creăm o instanță Axios cu setări predefinite
const apiClient = axios.create({
    baseURL: 'http://localhost:8081', // URL-ul de bază al backend-ului
    withCredentials: true, // ESENȚIAL: Spune Axios să trimită cookie-urile la fiecare cerere
});

export default apiClient;