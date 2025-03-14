import { Node } from "@/types";
import { GoogleMap, LoadScript, OverlayView } from "@react-google-maps/api";
import React from "react";

interface MapProps {
  nodes: Node[];
  selectedSwitchId: string | null;
  setSelectedSwitchId: (id: string | null) => void;
}

const Map: React.FC<MapProps> = ({
  nodes,
  selectedSwitchId,
  setSelectedSwitchId,
}) => {
  const mapCenter = {
    lat: 25.012148367198414,
    lng: 121.54131693029791,
  };

  const mapOptions = {
    mapTypeId: "satellite" as const,
    disableDefaultUI: true,
    tilt: 0,
  };

  return (
    <LoadScript googleMapsApiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!}>
      <GoogleMap
        mapContainerStyle={{
          width: "100%",
          height: "100%",
          borderRadius: ".5rem",
          border: "1px solid hsl(var(--input))",
        }}
        center={mapCenter}
        options={mapOptions}
        zoom={18}
      >
        {nodes.map((node) => (
          <OverlayView
            key={node.id}
            position={{ lat: node.lat, lng: node.lng }}
            mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
          >
            <div
              className={`w-24 ${
                selectedSwitchId === node.id ? "bg-blue-500" : "bg-red-500"
              } rounded-xl p-2 border cursor-pointer`}
              onClick={() => setSelectedSwitchId(node.id)}
            >
              <p className="text-white font-semibold">{node.name}</p>
              <p className="text-white text-sm">ID: {node.id}</p>
            </div>
          </OverlayView>
        ))}
      </GoogleMap>
    </LoadScript>
  );
};

export default Map;
