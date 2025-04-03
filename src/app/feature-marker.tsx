import {
  AdvancedMarker,
  AdvancedMarkerAnchorPoint,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";

interface TreeMarkerProps {
  position: google.maps.LatLngLiteral;
  featureId: string;
}

export const FeatureMarker = ({ position, featureId }: TreeMarkerProps) => {
  const [markerRef] = useAdvancedMarkerRef();
  const id = Number(featureId);

  return (
    <AdvancedMarker
      ref={markerRef}
      position={position}
      anchorPoint={AdvancedMarkerAnchorPoint.BOTTOM}
      className={"marker feature"}
      onClick={(e) => {
        // Must call stop to prevent the map from being clicked
        e.stop();
      }}
      zIndex={1000}
    >
      <div className="relative flex flex-col">
        <div
          className={"flex flex-row rounded-full ring-[1px] ring-gray-700"}
          style={{ zIndex: 1, width: `30px` }}
        >
          <button
            key={id + "-" + featureId}
            onClick={(e) => {
              e.stopPropagation();
            }}
            onMouseEnter={(e) => {
              e.preventDefault();
            }}
            className={
              "flex-1 cursor-pointer border-b-2 border-t-2 border-foreground bg-background py-2 text-center text-foreground border-l-2 border-r-2 rounded-r-full rounded-l-full"
            }
          >
            T
          </button>
        </div>
        <svg
          viewBox="0 0 40 40"
          className="-mt-[10.5px] w-[28px] self-center"
          style={{ zIndex: 0 }}
        >
          <path
            className={"fill-foreground"}
            d={"M34 10 L26 24.249 Q20 34.641 14 24.249 L6 10"}
            stroke="none"
          />
          <path
            d={"M34 10 L26 24.249 Q20 34.641 14 24.249 L6 10"}
            stroke="background"
            strokeWidth={0.5}
            fill="none"
          />
        </svg>
      </div>
    </AdvancedMarker>
  );
};
