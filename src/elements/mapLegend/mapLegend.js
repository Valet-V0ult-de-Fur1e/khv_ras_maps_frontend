import "./styles.css";
import { MapControl, withLeaflet } from "react-leaflet";
import L from "leaflet";
import { useState, useEffect } from "react";

const Legend = ({ cropList, setStatus, leaflet }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed(prevState => !prevState);
    setStatus(!isCollapsed);
  };

  useEffect(() => {
    const map = leaflet.map;
    const MapLegend = L.Control.extend({
      onAdd: () => {
        const div = L.DomUtil.create("div", "info legend");

        // Create toggle button
        const toggleButton = L.DomUtil.create("button", "toggle-btn");
        toggleButton.innerHTML = isCollapsed ? "▶" : "▼";
        L.DomEvent.on(toggleButton, "click", toggleCollapse);

        // Create crop list labels
        const labels = cropList.map((item) => {
          return `<div class="label-item"><i style="background:${item.crop_color}"></i>${item.crop_name}</div>`;
        });
        const labelDiv = L.DomUtil.create("div", "labels");
        labelDiv.classList.toggle('collapsed', isCollapsed);
        labelDiv.innerHTML = labels.join("");

        // Append button and labels to the control div
        div.appendChild(toggleButton);
        div.appendChild(labelDiv);
        return div;
      },

      onRemove: () => {
        // Cleanup event listeners when the control is removed
        const toggleButton = L.DomUtil.get("toggle-btn");
        if (toggleButton) {
          L.DomEvent.off(toggleButton, "click", toggleCollapse);
        }
      },
    });

    // Add legend control to the map
    const legendControl = new MapLegend({ position: "bottomright" });
    map.addControl(legendControl);

    // Cleanup when the component is unmounted or map changes
    return () => {
      map.removeControl(legendControl);
    };
  }, [isCollapsed, cropList, leaflet.map]); // Re-run effect if these values change

  return null;
};

export default withLeaflet(Legend);
