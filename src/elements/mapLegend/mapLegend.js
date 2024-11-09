import "./styles.css";
import { MapControl, useLeaflet, withLeaflet } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
class Legend extends MapControl {
  createLeafletElement(props) {
    this.crop_list = props.cropList
    const MapLegend = L.Control.extend({
      onAdd: (map) => {
        const div = L.DomUtil.create("div", "info legend");
        let labels = [];
        this.crop_list.map(
          (item) => {
            labels.push(
              '<i style="background:' + item.crop_color + '"></i> ' + item.crop_name
            );
          }
        )
        div.innerHTML = labels.join("<br>");
        return div;
      }
    })
    return new MapLegend({ position: 'bottomright' });
  }

}

export default withLeaflet(Legend);
