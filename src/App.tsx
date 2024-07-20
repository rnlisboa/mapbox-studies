import { Pin } from "lucide-react";
import "mapbox-gl/dist/mapbox-gl.css"
import { useState, useEffect } from "react"
import cabana from "./assets/img/cabana3.jpg"
import ReactMapGl, { Marker,  Source, Layer } from "react-map-gl"
import mapboxSdk from '@mapbox/mapbox-sdk';
import directions from '@mapbox/mapbox-sdk/services/directions';

const TOKEN: string = 'pk.eyJ1IjoicmVuYW5saXNib2EiLCJhIjoiY2x5ZWJndm11MDBzZDJtcHc5cmt5eGk5NyJ9.vVttItTEnoh1r1n9NCYwcg'

interface MapProps {
  latitude: number;
  longitude: number;
  zoom: number;
}

const MapboxClient = mapboxSdk({ accessToken: TOKEN });
const directionsClient = directions(MapboxClient);

function App() {
  const [coordinates, setCoordinates] = useState<Omit<MapProps, 'zoom'> | null>({
    latitude: -5.689602298880636,
    longitude: -35.27292339567472
  });

  const [route, setRoute] = useState<GeoJSON.FeatureCollection<GeoJSON.Geometry>>({
    type: 'FeatureCollection',
    features: []
  });

  useEffect(() => {
    getRoute();
  }, []);

  const getRoute = async () => {
    try {
      const response = await directionsClient.getDirections({
        profile: 'driving',
        geometries: 'geojson',
        waypoints: [
          { coordinates: [-35.209, -5.795] }, // Natal, RN
          { coordinates: [-35.263, -5.505] }  // Maxaranguape, RN
        ]
      }).send();

      setRoute(response.body.routes[0].geometry);
    } catch (error) {
      console.error('Error fetching directions:', error);
    }
  };

  const [viewport, setViewport] = useState<MapProps>({
    latitude: -5.687981,
    longitude: -35.273460,
    zoom: 15
  })
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactMapGl
        initialViewState={{ ...viewport }}
        mapboxAccessToken={TOKEN}
        style={{ width: "100%", height: "100%", animationDuration: "200" }}
        mapStyle={"mapbox://styles/mapbox/streets-v9"}
        onMove={evt => setViewport(evt.viewState)}
      >
        {coordinates && (
          <Marker
            latitude={coordinates.latitude}
            longitude={coordinates.longitude}
            anchor="bottom"
          >
            <div style={{ width: 50, height: 50, backgroundColor: 'red', borderRadius: '300px' }}>
              <img src={cabana} style={{ width: "100%", height: "100%", backgroundColor: 'red' }} alt="Cabana" />
            </div>
          </Marker>
        )}

        {route && (
          <Source id="route" type="geojson" data={route}>
            <Layer
              id="route"
              type="line"
              source="route"
              layout={{
                'line-join': 'round',
                'line-cap': 'round'
              }}
              paint={{
                'line-color': '#888',
                'line-width': 6
              }}
            />
          </Source>
        )}
      </ReactMapGl>
    </div>
  );

}

export default App
