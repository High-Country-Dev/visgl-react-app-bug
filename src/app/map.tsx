"use client";

import { APIProvider, Map } from "@vis.gl/react-google-maps";
import { useEffect, useState } from "react";
import { ClusteredMarkers } from "./clustered-markers";

interface MapConfig {
  id: string;
  label: string;
  mapId?: string;
  mapTypeId?: string;
  styles?: google.maps.MapTypeStyle[];
}

const MapTypeId = {
  HYBRID: "hybrid",
  ROADMAP: "roadmap",
  SATELLITE: "satellite",
  TERRAIN: "terrain",
};

const MAP_CONFIGS: MapConfig[] = [
  {
    id: "light",
    label: "Light",
    mapId: "c125c852122e9fed",
    mapTypeId: MapTypeId.ROADMAP,
  },
  {
    id: "dark",
    label: "Dark",
    mapId: "d8b7f3c31882c7b2",
    mapTypeId: MapTypeId.ROADMAP,
  },
  {
    id: "hybrid",
    label: "Hybrid (no mapId)",
    mapId: "92006e222591cd7f",
    mapTypeId: MapTypeId.HYBRID,
  },
];

export const GoogleMapComponent = () => {
  return (
    <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_API_KEY ?? ""}>
      <ProvidedGoogleMapComponent />
    </APIProvider>
  );
};

const ProvidedGoogleMapComponent = () => {
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);
  if (!isMounted) {
    return <div style={{ height: "100vh", width: "100%" }} />;
  }

  return (
    <div
      style={{
        height: "100vh",
        width: "100%",
      }}
    >
      <Map
        mapId={MAP_CONFIGS[0].mapId}
        mapTypeId={MAP_CONFIGS[0].mapTypeId}
        styles={MAP_CONFIGS[0].styles}
        defaultZoom={3}
        defaultCenter={{ lat: 37.774929, lng: -122.419418 }}
        gestureHandling="greedy"
        streetViewControl={false}
        mapTypeControl={false}
        fullscreenControl={false}
        zoomControl={true}
        cameraControl={false}
        disableDoubleClickZoom
        // styles={[ { featureType: "all", elementType: "all", stylers: [{ visibility: "off" }], }, ]}
        clickableIcons={false}
      >
        <ClusteredMarkers />
      </Map>
    </div>
  );
};
