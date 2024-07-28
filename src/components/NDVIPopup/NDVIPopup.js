import React, { useEffect, useState } from "react";
import "./NDVIPopup.css"
import axios from "axios";
import getServerAPIURL from "../../elements/serverAPI.js"
import { Map, TileLayer, Polygon, LayerGroup, LayersControl, Circle, Popup } from "react-leaflet";


const NDVIPopup = ({ active, setActive, selectedPolygonData }) => {
  console.log(selectedPolygonData)

  const [NDVIpoints, setNDVIpoints] = useState([]);

  useEffect(
    () => {
      axios.get(getServerAPIURL() + "/api/list-of-ndvi/?y=" + selectedPolygonData.properties.year_ + "&v=1&s=20&fi=" + selectedPolygonData.id)
        .then((res) => {
          setNDVIpoints(res.data.features);
        })
        .catch((error) => {
          console.log(error)
        })
    }, []
  )

  return (
    <div className={active ? "modal active" : "modal"} onClick={() => setActive(false)}>
      <div className="modal__content" onClick={e => e.stopPropagation()}>
        {
          selectedPolygonData? <Map
          {...{
            center: [48.5189, 135.2786],
            zoom: 13,
            editable: true,
          }
          }
        >
          <LayersControl>
            <LayersControl.BaseLayer name="Open Street Map">
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer checked name="Google Map">
              <TileLayer
                attribution="Google Maps"
                url="https://www.google.cn/maps/vt?lyrs=m@189&gl=cn&x={x}&y={y}&z={z}"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Google Map Satellite">
              <LayerGroup>
                <TileLayer
                  attribution="Google Maps Satellite"
                  url="https://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}"
                />
                <TileLayer url="https://www.google.cn/maps/vt?lyrs=y@189&gl=cn&x={x}&y={y}&z={z}" />
              </LayerGroup>
            </LayersControl.BaseLayer>
          </LayersControl>
          <Polygon
              positions={selectedPolygonData.geometry.coordinates[0]}
              color={(selectedPolygonData.properties.crop_info === null) ? selectedPolygonData.properties.crop_color : selectedPolygonData.properties.crop_info.crop_color}
            >
              <Popup>
                <p>номер реестра: {selectedPolygonData.properties.reestr_number}</p>
                <p>с\х культура: {(selectedPolygonData.properties.crop_info === null) ? selectedPolygonData.properties.crop_color : selectedPolygonData.properties.crop_info.crop_name}</p>
                <p>год: {selectedPolygonData.properties.year_}</p>
                <p>площадь: {selectedPolygonData.properties.area}</p>
              </Popup>
            </Polygon>
          {
            NDVIpoints.map(
              (point) =>
                <Circle
                  center={{ lat: point.geometry.coordinates[1], lng: point.geometry.coordinates[0] }}
                  radius={10}
                />
            )
          }
        </Map> : <></>
        }
      </div>
    </div>
  );
}

export default NDVIPopup;