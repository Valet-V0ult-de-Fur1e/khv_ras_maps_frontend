import "./styles.css";
import { MapControl, useLeaflet, withLeaflet } from "react-leaflet";
import L from "leaflet";

// class Legend extends MapControl {
//   createLeafletElement(props) {
//     console.log(props)
//     this.crop_list = props.cropList
//   }

//   componentDidMount() {
//     const legend = L.control({ position: "bottomright" });
//     legend.onAdd = () => {
//       const div = L.DomUtil.create("div", "info legend");
//       let labels = [];
//       let data = [];

//       this.crop_list.map(
//         (item) => {
//           labels.push(
//             '<i style="background:' + item.crop_color + '"></i> ' + item.crop_name
//           );
//         }
//       )
//       div.innerHTML = labels.join("<br>");
//       return div;
//     };

//     const { map } = this.props.leaflet;
//     legend.addTo(map);
//     return () => {
//       map.removeControl(legend);
//     };
//   }

//   // map.removeControl(legend);
// }

// export default withLeaflet(Legend);

const Legend = (crop_list) => {
  const map = useLeaflet();

  useEffect(() => {
    const legend = L.control({ position: "bottomright" });
    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend");
      let labels = [];
      crop_list.map(
        (item) => {
          labels.push(
            '<i style="background:' + item.crop_color + '"></i> ' + item.crop_name
          );
        }
      )
      div.innerHTML = labels.join("<br>");
      return div;
    };
    legend.addTo(map);
    return () => {
      map.removeControl(legend);
    };
  }, [map]);

  return null;
};

export default Legend;