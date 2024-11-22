import React, { useEffect, useState } from "react"
import { Map, TileLayer, FeatureGroup, Polygon, Popup, LayerGroup, LayersControl, ImageOverlay } from "react-leaflet";
import Legend from "../../elements/mapLegend/mapLegend.js"

const NDVIMap = ({cropList, points, selectedPolygonData}) => {
  function getColor(dataCropID) {
    if (dataCropID === null || dataCropID === undefined) return "black"
    return cropList.filter(item => item.id === dataCropID)[0].crop_color
  }
  return (
    <div>
      <Map
        {...{
          center: selectedPolygonData.geom.coordinates[0][0][0],
          zoom: 15,
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
          key={0}
          positions={selectedPolygonData.geom.coordinates}
          color={getColor(selectedPolygonData.id_crop_fact)}
          fillOpacity={0.5}
        >
        </Polygon>
        {
          points
        }
        <Legend cropList={cropList} />
      </Map>
    </div>
  )
}

export default NDVIMap;