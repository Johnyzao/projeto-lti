
import React, { useRef, useEffect, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import "mapbox-gl/dist/mapbox-gl.css";

const MapComponent = ({ handleLocationSelection }) => {
    const mapContainerRef = useRef(null);
    const [selectedLocation, setSelectedLocation] = useState(null);
    const [userLocationMarker, setUserLocationMarker] = useState(null);
    const [selectedLocationMarker, setSelectedLocationMarker] = useState(null);
    const [selectedLocationCoordinates, setSelectedLocationCoordinates] = useState(null);

    useEffect(() => {
        if (!mapContainerRef.current) return;

        mapboxgl.accessToken = 'pk.eyJ1Ijoiam9hbmEyNCIsImEiOiJjbHdjYWthd28wcWo0MnFwcGM4cnJzdTlnIn0.bkRMTa52BMm2Tv2EahXx0w';
        const map = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [-8.0, 39.5],
            zoom: 6
        });

        const addMarker = (lng, lat, color, markerStateSetter) => {
            if (markerStateSetter.current) {
                markerStateSetter.current.remove();
            }

            const newMarker = new mapboxgl.Marker({
                color,
                draggable: false
            })
            .setLngLat([lng, lat])
            .addTo(map);

            markerStateSetter.current = newMarker;

            setSelectedLocation({ lng, lat });
            setSelectedLocationCoordinates({ lng, lat });
        };

        map.on('click', (e) => {
            const { lng, lat } = e.lngLat;
            setSelectedLocation({ lng, lat });
            setSelectedLocationCoordinates({ lng, lat });
            addMarker(lng, lat, '#ff0000', setSelectedLocationMarker);
        });

        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    map.setCenter([longitude, latitude]);
                    map.setZoom(12);

                    addMarker(longitude, latitude, '#0000ff', setUserLocationMarker);
                },
                (error) => {
                    console.error('Error retrieving location:', error);
                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }

        return () => map.remove();
    }, []);
                  //https://www.openstreetmap.org/search?query=38.7564904%2C%20-9.1569918#map=16/38.7563/-9.1570
                  //usar este site
    return (
      <>
          <div ref={mapContainerRef} style={{ width: '100%', height: '400px' }} />
          {selectedLocationCoordinates ? (
              <div>
                  <h2>Coordenadas:</h2> 
                  <p>{selectedLocationCoordinates.lat} , {selectedLocationCoordinates.lng}</p>
                  
                  
              </div>
          ) : (
              <p>Selecione um local no mapa para ver as coordenadas.</p>
          )}
      </>
  );
};

export default MapComponent;
