import { useMap } from "@vis.gl/react-google-maps";
import type {
  Feature,
  FeatureCollection,
  GeoJsonProperties,
  Point,
} from "geojson";
import { useCallback, useEffect, useMemo, useReducer } from "react";
import type { ClusterProperties } from "supercluster";
import Supercluster from "supercluster";

interface F3ClusterProperties extends ClusterProperties {
  logos?: string;
}

interface MarkersProps {
  geojson: FeatureCollection<Point, MarkerProperties>;
}

interface MarkerProperties {
  name?: string | null;
}

const superclusterOptions: Supercluster.Options<
  MarkerProperties,
  F3ClusterProperties
> = {
  extent: 256, // smaller means more in a cluster
  radius: 64, // Adjust this. smaller means more smaller clusters
  maxZoom: 12,
};

export const ClusteredMarkers = () => {
  const data = useData();

  const geojson = useMemo(() => {
    return getGeojson(data);
  }, [data]);
  return geojson && <DataProvidedClusteredMarkers geojson={geojson} />;
};

const DataProvidedClusteredMarkers = ({ geojson }: MarkersProps) => {
  const map = useMap();
  const { clusters, getLeaves } = useSupercluster(geojson, superclusterOptions);
  const handleClusterClick = useCallback(
    (marker: google.maps.marker.AdvancedMarkerElement, clusterId: number) => {
      // negative padding - https://github.com/visgl/react-google-maps/discussions/591
      const leaves = getLeaves(clusterId);
      const boundsOfLeaves = getBoundsOfLeaves(leaves);
      map?.fitBounds(boundsOfLeaves, 0);
    },
    [getLeaves, map]
  );

  return (
    <>
      {clusters.map((feature) => {
        const [lng, lat] = feature.geometry.coordinates;
        if (typeof lng !== "number" || typeof lat !== "number") return null;
        const featureId = feature.id?.toString();
        if (!featureId) return null;

        const clusterProperties = feature.properties as F3ClusterProperties;
        const isCluster: boolean = clusterProperties.cluster;

        return isCluster ? (
          <FeaturesClusterMarker
            key={featureId}
            clusterId={clusterProperties.cluster_id}
            position={{ lat, lng }}
            size={clusterProperties.point_count}
            sizeAsText={String(clusterProperties.point_count_abbreviated)}
            onMarkerClick={handleClusterClick}
          />
        ) : (
          <FeatureMarker
            key={featureId}
            featureId={featureId}
            position={{ lat, lng }}
          />
        );
      })}
    </>
  );
};

const getBoundsOfLeaves = (leaves: Feature<Point>[]) => {
  const bounds = new google.maps.LatLngBounds();
  leaves.forEach((leaf) => {
    const [lng, lat] = leaf.geometry.coordinates;
    if (typeof lng !== "number" || typeof lat !== "number") return;
    bounds.extend({ lat, lng });
  });
  return bounds;
};

const getGeojson = (
  filteredLocationMarkers: {
    id: number;
    name: string;
    lat: number;
    lon: number;
  }[]
) => {
  const geojson = filteredLocationMarkers.reduce(
    (acc, marker) => {
      if (typeof marker.lon !== "number" || typeof marker.lat !== "number") {
        return acc;
      }
      acc.features.push({
        id: marker.id,
        type: "Feature",
        geometry: { type: "Point", coordinates: [marker.lon, marker.lat] },
        properties: {
          name: marker.name,
        },
      });
      return acc;
    },
    { features: [], type: "FeatureCollection" } as FeatureCollection<
      Point,
      MarkerProperties
    >
  ) ?? { features: [], type: "FeatureCollection" };
  return geojson;
};

import { FeatureMarker } from "./feature-marker";
import { FeaturesClusterMarker } from "./features-marker-cluster";
import { useMapViewport } from "./use-map-viewport";

export function useSupercluster<T extends GeoJsonProperties>(
  geojson: FeatureCollection<Point, T>,
  superclusterOptions: Supercluster.Options<T, ClusterProperties>
) {
  // create the clusterer and keep it
  const clusterer = useMemo(() => {
    return new Supercluster(superclusterOptions);
  }, [superclusterOptions]);

  // version-number for the data loaded into the clusterer
  // (this is needed to trigger updating the clusters when data was changed)
  const [version, dataWasUpdated] = useReducer((x: number) => x + 1, 0);

  // when data changes, load it into the clusterer
  useEffect(() => {
    clusterer.load(geojson.features);
    dataWasUpdated();
  }, [clusterer, geojson]);

  // get bounding-box and zoomlevel from the map
  const { bbox, zoom } = useMapViewport({ padding: 100 });

  // retrieve the clusters within the current viewport
  const clusters = useMemo(() => {
    // don't try to read clusters before data was loaded into the clusterer (version===0),
    // otherwise getClusters will crash
    if (!clusterer || version === 0) return [];

    return clusterer.getClusters(bbox, zoom);
  }, [version, clusterer, bbox, zoom]);

  // create callbacks to expose supercluster functionality outside of this hook
  const getChildren = useCallback(
    (clusterId: number) => clusterer.getChildren(clusterId),
    [clusterer]
  );

  // note: here, the paging that would be possible is disabled; we found this
  // has no significant performance impact when it's just used in a click event handler.
  const getLeaves = useCallback(
    (clusterId: number) => clusterer.getLeaves(clusterId, Infinity),
    [clusterer]
  );

  const getClusterExpansionZoom = useCallback(
    (clusterId: number) => clusterer.getClusterExpansionZoom(clusterId),
    [clusterer]
  );

  return {
    clusters,
    getChildren,
    getLeaves,
    getClusterExpansionZoom,
  };
}

const useData = () => {
  // Make 3000 markers
  return Array.from({ length: 3000 }, (_, i) => ({
    id: i,
    name: `Marker ${i}`,
    lat: 24.396308 + Math.random() * (49.384358 - 24.396308), // Random latitude within continental US
    lon: -125.0 + Math.random() * (-66.93457 - -125.0), // Random longitude within continental US
  }));
};
