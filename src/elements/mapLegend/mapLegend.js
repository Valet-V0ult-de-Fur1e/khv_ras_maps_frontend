import "./styles.css";
import { MapControl, withLeaflet } from "react-leaflet";
import L from "leaflet";
import { useState, useEffect } from "react";

const Legend = ({ cropList, leaflet }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(prevState => !prevState);
  };

  useEffect(() => {
    const map = leaflet.map;
    const MapLegend = L.Control.extend({
      onAdd: () => {
        const div = L.DomUtil.create("div", "info legend");
        const toggleButton = L.DomUtil.create("button", "toggle-btn");
        toggleButton.innerHTML = isCollapsed ? "▶" : "▼";
        L.DomEvent.on(toggleButton, "click", toggleCollapse);
        const labels = cropList.map((item) => {
          return `<div class="label-item"><i style="background:${item.crop_color}"></i>${item.crop_name}</div>`;
        });
        const labelDiv = L.DomUtil.create("div", "labels");
        labelDiv.classList.toggle('collapsed', isCollapsed);
        labelDiv.innerHTML = labels.join("");
        div.appendChild(toggleButton);
        div.appendChild(labelDiv);
        return div;
      },

      onRemove: () => {
        const toggleButton = L.DomUtil.get("toggle-btn");
        if (toggleButton) {
          L.DomEvent.off(toggleButton, "click", toggleCollapse);
        }
      },
    });
    const legendControl = new MapLegend({ position: "bottomright" });
    map.addControl(legendControl);
    return () => {
      map.removeControl(legendControl);
    };
  }, [isCollapsed, cropList, leaflet.map]);
  return null;
};

export default withLeaflet(Legend);
