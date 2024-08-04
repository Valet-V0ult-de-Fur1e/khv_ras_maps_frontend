import React, { useState } from 'react';
import { Map, TileLayer, FeatureGroup, Polygon, Popup, LayerGroup, LayersControl, ImageOverlay } from "react-leaflet";
import "leaflet-editable";
import { EditControl } from "react-leaflet-draw";
import NDVIPopup from '../NDVIPopup/NDVIPopup';
import { useLocalStorage } from "../../elements/useLocalStorage.js"
import { PlottyGeotiffLayer } from '../../elements/GeotiffLayer.js';
import sputnikPhoto from "./LC08_L2SP_112026_20230324_20230404_02_T1_SR_B3.TIF"

class EditedMap extends React.Component {
  state = {
    mapOptions: {
      center: [48.5189, 135.2786],
      zoom: 11,
      editable: true,
      windSpeed: null,
    },
    editing: null,
    basemap: 'osm',
  }

  onBMChange = (bm) => {
    this.setState({
      basemap: bm
    });
  }

  mapRef = React.createRef()
  polygonRefs = []

  onClick = e => {
    const index = +e.target.dataset.index;
    const refs = this.polygonRefs;

    this.setState(({ editing }) => {
      refs.forEach((n, i) => {
        const method = i === index && editing !== index
          ? 'enableEdit'
          : 'disableEdit';
        n.leafletElement[method]();
      });
      return {
        editing: editing === index ? null : index,
      };
    });
  }

  onClick1 = e => {
    const refs = this.polygonRefs;

    this.setState(({ editing }) => {
      refs.forEach((n, i) => {
        n.leafletElement['disableEdit']();
      });

      return {
        editing: null,
      };
    });
  }

  onLoad = e => {
    e.target.on('editable:disable', this.onEditEnd);
  }

  onEditEnd = ({ layer }) => {

    function updatePolygon(polygon, newCoords) {
      let newDataPolygon = polygon
      newDataPolygon.geometry.coordinates = [newCoords._latlngs]
      return newDataPolygon
    }

    this.setState(({ polygons }) => ({
      polygons: polygons.map((n, i) => i === layer.options.index ?
        updatePolygon(n, layer) : n
      ),
    }));
  }

  render() {

    const compliteShapeData = () => {
      let loadedServerData = this.props.shapeData
      loadedServerData.map(
        (polygon) => {
          polygon.geometry.coordinates.forEach((sub_polygons) => {
            sub_polygons.forEach(
              (polygon_coords_arr) => {
                polygon_coords_arr.reverse()
              }
            )
          }
          )
        }
      )
      return loadedServerData
    }

    const shapePolygons = compliteShapeData();
    const canShowShapeData = this.props.showShapeDataFlag
    const polygons = this.props.data;
    const editing = this.state.editing;
    const refs = this.polygonRefs = [];
    const _created = (e) => console.log(e);
    console.log(this.props)
    return (
      <div>
        <Map
          {...this.state.mapOptions}
          ref={this.mapRef}
          whenReady={this.onLoad}
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
          <FeatureGroup>
            <EditControl
              position="topright"
              onCreated={_created}
              draw={
                {
                  rectangle: false,
                  circle: false,
                  circlemarker: false,
                  marker: false,
                  polyline: false,
                }
              }
            />
          </FeatureGroup>
          {polygons.map((n, i) =>
            <Polygon
              key={i}
              positions={n.geometry.coordinates[0]}
              ref={ref => refs[i] = ref}
              onEditabl_edisable={this.onEditEnd}
              index={i}
              color={(n.properties.crop_info === null) ? n.properties.crop_color : n.properties.crop_info.crop_color}
            >
              <Popup>
                <p>номер реестра: {n.properties.reestr_number}</p>
                <p>с\х культура: {(n.properties.crop_info === null) ? n.properties.crop_color : n.properties.crop_info.crop_name}</p>
                <p>год: {n.properties.year_}</p>
                <p>площадь: {n.properties.area}</p>
                <button
                  data-index={i}
                  className={editing === i ? 'active' : ''}
                  onClick={this.onClick}
                >редактировать</button>
                <button onClick={(e) => { this.props.NDVIAPI(true); this.props.selecterApi(n) }}>
                  NDVI
                </button>
              </Popup>
            </Polygon>
          )}
          {canShowShapeData? shapePolygons.map((n, i) =>
            <Polygon
              key={i + 10000}
              positions={n.geometry.coordinates[0]}
              index={i + 1000}
            >
            </Polygon>
          ):<></>}
        </Map>
      </div>
    );
  }
}

const AdminMap = (props) => {
  const [NDVIWinIsActivae, setNDVIWinIsActivae] = useLocalStorage("modalIsActive", false);
  const [selectedNDVIPolygon, setSelectedNDVIPolygon] = useLocalStorage("selectedPolygon", {});
  return (
    <div>
      <EditedMap data={props.data} NDVIAPI={setNDVIWinIsActivae} selecterApi={setSelectedNDVIPolygon} shapeData={props.shapeData} showShapeDataFlag={props.showShapeDataFlag} />
      {
        selectedNDVIPolygon.id ? <NDVIPopup active={NDVIWinIsActivae} setActive={setNDVIWinIsActivae} selectedPolygonData={selectedNDVIPolygon} /> : <></>
      }
      {/* <img src={sputnikPhoto}></img> */}
    </div>
  )
}

export default AdminMap