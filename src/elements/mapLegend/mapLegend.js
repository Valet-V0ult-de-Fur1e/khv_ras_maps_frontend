import "./styles.css";
import { MapControl, withLeaflet } from "react-leaflet";
import L from "leaflet";

class Legend extends MapControl {
  createLeafletElement(props) {
    this.crop_list = props.cropList
   }

  componentDidMount() {
    const legend = L.control({ position: "bottomright" });
    console.log(this.crop_list.length)
    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend");
      let labels = [];
      let data = [];

      this.crop_list.map(
        (item) => {
          labels.push(
            '<i style="background:' + item.crop_color + '"></i> ' +  item.crop_name
          );
        }
      )
      div.innerHTML = labels.join("<br>");
      return div;
    };

    const { map } = this.props.leaflet;
    legend.addTo(map);
  }
}

export default withLeaflet(Legend);