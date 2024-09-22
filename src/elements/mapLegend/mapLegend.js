import "./styles.css";
import { MapControl, withLeaflet } from "react-leaflet";
import L from "leaflet";
import axios from "axios";
import getServerAPIURL from "../../elements/serverAPI.js";

class Legend extends MapControl {
  createLeafletElement(props) { }

  componentDidMount() {
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend");
      let labels = [];
      let data = [];

      axios.get(getServerAPIURL() + "/api/list-of-crops/").
        then((response) => {
          data = response.data.data
          data.map(
            (item) => {
              labels.push(
                '<i style="background:' + item.crop_color + '"></i> ' +  item.crop_name
              );
            }
          )
          div.innerHTML = labels.join("<br>");
          return div;
        }).
        catch((error) => {
          console.log(error)
          return <></>
        })
        return div;
    };

    const { map } = this.props.leaflet;
    legend.addTo(map);
  }
}

export default withLeaflet(Legend);
