import './style.css'
import axios from 'axios';

const loader = document.getElementById('loader');

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const initializeMap = () => {
  const map = new mapboxgl.Map({
    container: 'mapa',
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [-88.8965, 13.7941],
    zoom: 10,
    cooperativeGestures: true
  });

  map.addControl(new mapboxgl.NavigationControl());
  map.addControl(new mapboxgl.FullscreenControl());

  return map;
};

const map = initializeMap();

const updateWeatherInfo = (data) => {
  const infoElements = {
    current_temp: `${data.temperature} °C`,
    daily_temp_max: `${data.maxTemperature} °C`,
    daily_temp_min: `${data.minTemperature} °C`,
    current_humidity: `${data.humidity} %`,
    current_weather: data.description,
    current_wind_speed: `${data.windSpeed} m/s`,
    current_precipitation: `${data.precipitation} mm/h`,
    daily_weather: data.summary,
    daily_pop: `${data.dailyPop} %`
  };

  Object.entries(infoElements).forEach(([id, value]) => {
    document.getElementById(id).innerHTML = value;
  });
};

const getCurrentCoords = async () => {


  if (!navigator.geolocation) return alert("Geolocalizacion no está disponible en tu navegador");

  navigator.geolocation.getCurrentPosition(
    position => {
      getClima(position.coords.longitude, position.coords.latitude);
      document.getElementById('info').classList.remove('hidden');
    },
    () => alert("No fue posible obtener tu ubicación")
  );
}

const handleGetClima = () => {

  const direccion = document.getElementById("input-ubicacion").value;
  axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/coordenadas?direccion=${encodeURIComponent(direccion)}`)
    .then(({ data }) => getClima(data.long, data.lat))
    .catch(error => alert("Error al obtener las coordenadas", error));


}

const getClima = async (long, lat) => {
  try {
    const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/api/clima?lat=${encodeURIComponent(lat)}&long=${encodeURIComponent(long)}`);

    updateWeatherInfo(data);

    map.flyTo({ center: [long, lat], zoom: 14 });
    new mapboxgl.Marker().setLngLat([long, lat]).addTo(map);
  } catch (error) {
    alert("Error al obtener la información del clima", error);
  } finally {
    loader.style.display = 'none'; // Ocultar el loader
  }
};



document.getElementById("btn-get").addEventListener("click", handleGetClima)


window.onload = getCurrentCoords