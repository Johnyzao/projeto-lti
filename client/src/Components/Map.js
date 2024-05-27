import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css"

const MapComponent = () => {
  const mapContainerRef = useRef(null);

  useEffect(() => {
    mapboxgl.accessToken = 'pk.eyJ1Ijoiam9hbmEyNCIsImEiOiJjbHdjYWthd28wcWo0MnFwcGM4cnJzdTlnIn0.bkRMTa52BMm2Tv2EahXx0w';
    const map = new mapboxgl.Map({
      container: mapContainerRef.current, // Verifique se mapContainerRef.current está definido corretamente
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [-8.0, 39.5], // Coordenadas do centro de Portugal
      zoom: 6 // Zoom inicial
    });

    // Restante do código...

  }, []); // Certifique-se de passar um array de dependências vazio para useEffect

  return  <div ref={mapContainerRef} style={{ width: '100%', height: '400px' }} />;
};

export default MapComponent;

