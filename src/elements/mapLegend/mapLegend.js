import "./styles.css";
import { MapControl, useLeaflet, withLeaflet } from "react-leaflet";
import L from "leaflet";
import { useEffect } from "react";
class Legend extends MapControl {
  createLeafletElement(props) {
    console.log(props)
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
  //   createLeafletElement(opts) {
  //     const MapInfo = L.Control.extend({
  //       onAdd: (map) => {
  //         this.panelDiv = L.DomUtil.create('div', 'info');
  //         return this.panelDiv;
  //       }
  //     });
  //     return new MapInfo({ position: 'bottomleft' });
  // }

  // componentDidMount() {
  //   const legend = L.control({ position: "bottomright" });
  //   legend.onAdd = () => {
  //     const div = L.DomUtil.create("div", "info legend");
  //     let labels = [];
  //     let data = [];

  //     this.crop_list.map(
  //       (item) => {
  //         labels.push(
  //           '<i style="background:' + item.crop_color + '"></i> ' + item.crop_name
  //         );
  //       }
  //     )
  //     div.innerHTML = labels.join("<br>");
  //     return div;
  //   };

  //   const { map } = this.props.leaflet;
  //   legend.addTo(map);
  //   map.removeControl(legend);
  //   // return () => {
  //   //   // legend.removeFrom(map)
  //   //   map.removeControl(legend);
  //   // };
  // }

  // map.removeControl(legend);
}

export default withLeaflet(Legend);

// const Legend = (props) => {
//   const mapL = useLeaflet();

//   useEffect(() => {
//     const legend = L.control({ position: "bottomright" });
//     console.log(props)
//     const div = L.DomUtil.create("div", "info legend");
//     let labels = [];
//     legend.onAdd = () => {
//       props.cropList.map(
//         (item) => {
//           labels.push(
//             '<i style="background:' + item.crop_color + '"></i> ' + item.crop_name
//           );
//         }
//       )
//       div.innerHTML = labels.join("<br>");
//       return div;
//     };
//     legend.addTo(mapL);
//     return () => {
//       mapL.removeControl(legend);
//     };
//   }, [mapL]);

//   return null;
// };

// export default withLeaflet(Legend);