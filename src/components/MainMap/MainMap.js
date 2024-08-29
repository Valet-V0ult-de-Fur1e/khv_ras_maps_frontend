import React, { useEffect, useState } from "react"
import { Map, TileLayer, FeatureGroup, Polygon, Popup, LayerGroup, LayersControl, ImageOverlay } from "react-leaflet";
import "leaflet-editable";
import { EditControl } from "react-leaflet-draw";
import NDVIPopup from '../NDVIPopup/NDVIPopup';

let mainMapData = [];
let userMapData = [];

const MainMap = (props) => {
  const mapOptions = {
    center: [48.5189, 135.2786],
    zoom: 11,
    editable: true
  };

  const [editingMainMapPolygonId, setEditingMainMapPolygonId] = useState(null);
  const [editingUserMapPolygonId, setEditingUserMapPolygonId] = useState(null);

  const [NDVIWinIsActivae, setNDVIWinIsActivae] = useState(false);
  const [selectedNDVIPolygon, setSelectedNDVIPolygon] = useState({});

  mainMapData = props.data;
  userMapData = props.userMapData;

  const mapRef = React.createRef();

  const onLoad = e => {
    e.target.on('editable:disable', onEditEnd);
  }

  let mainMapRefs = [];
  let userMapRefs = [];

  const newPolygonCreated = (e) => {
    console.log(e.layer._latlngs);
  }

  const newPolygonCreatedUserMap = (e) => {
    function updatePolygon(polygon, newCoords) {
      let newPolygonData = []
      newCoords._latlngs.map(
        (points) => {
          points.map(
            (point) => newPolygonData.push(
              [point.lat, point.lng]
            )
          )
        }
      )
      let newDataPolygon = polygon
      newDataPolygon.geometry.coordinates.push([newPolygonData])
      return newDataPolygon
    }

    let newUserMapData = userMapData.map((n, i) => {
      return i === editingUserMapPolygonId ? updatePolygon(n, e.layer) : n
    })
    props.updateUserMapData(newUserMapData)
  }

  const newPolygonCreatedMainMap = (e) => {
    function updatePolygon(polygon, newCoords) {
      let newPolygonData = []
      newCoords._latlngs.map(
        (points) => {
          points.map(
            (point) => newPolygonData.push(
              [point.lat, point.lng]
            )
          )
        }
      )
      let newDataPolygon = polygon
      console.log(newDataPolygon)
      newDataPolygon.geometry.coordinates.push([newPolygonData])
      console.log(newDataPolygon)
      return newDataPolygon
    }

    let newMainMapData = mainMapData.map((n, i) => {
      return i === editingMainMapPolygonId ? updatePolygon(n, e.layer) : n
    })
    props.updateMapData(newMainMapData)
  }

  const onEditEnd = ({ layer }) => {
    function updatePolygon(polygon, newCoords) {
      let newDataPolygon = polygon
      newDataPolygon.geometry.coordinates = [newCoords._latlngs]
      return newDataPolygon
    }

    if (layer.options["data-id"] === 1) {

      let newMapData = mainMapData.map((n, i) => {
        return i === layer.options.index ? updatePolygon(n, layer) : n
      }
      )
      props.updateMapData(newMapData)
    }

    if (layer.options["data-id"] === 2) {
      let newData = userMapData.map((n, i) => {
        return i === layer.options.index ? updatePolygon(n, layer) : n
      }
      )
      props.updateUserMapData(newData)
    }
  }

  function EditPolygon(e) {
    if (props.editModFlag) {
      const index = e.target.options.index;
      const refs = mainMapRefs;
      refs.forEach((n, i) => {
        const method = i === index && editingMainMapPolygonId !== index
          ? 'enableEdit'
          : 'disableEdit';
        if (i === index) n.leafletElement[method]();
        // n.leafletElement[method]();
      });
      setEditingMainMapPolygonId(editingMainMapPolygonId === index ? null : index)
    }
  }

  function EditUserPolygon(e) {
    if (props.editModFlag) {
      const index = e.target.options.index;
      const refs = userMapRefs;
      refs.forEach((n, i) => {
        const method = i === index && editingUserMapPolygonId !== index
          ? 'enableEdit'
          : 'disableEdit';
        if (i === index) n.leafletElement[method]();
        // n.leafletElement[method]();
      });
      setEditingUserMapPolygonId(editingUserMapPolygonId === index ? null : index)
    }
  }

  function getTileLayer() {
    return !props.showSatelliteImage ?
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      /> :
      <><TileLayer
        attribution="Google Maps Satellite"
        url="https://www.google.cn/maps/vt?lyrs=s@189&gl=cn&x={x}&y={y}&z={z}"
      />
        {props.showSatelliteImageIcons ? <TileLayer url="https://www.google.cn/maps/vt?lyrs=y@189&gl=cn&x={x}&y={y}&z={z}" /> : <></>}
      </>
  }

  return (
    <div>
      <Map
        {...mapOptions}
        ref={mapRef}
        whenReady={onLoad}
      >
        {getTileLayer()}
        <LayersControl>
          <LayersControl.Overlay name="ВЦ ДВО РАН" checked={true}>
            <LayerGroup>
              {props.data.map((n, i) =>
                <FeatureGroup>
                  {
                    editingMainMapPolygonId === i ? <EditControl
                      position="topright"
                      onCreated={newPolygonCreatedMainMap}
                      draw={
                        {
                          rectangle: false,
                          circle: false,
                          circlemarker: false,
                          marker: false,
                          polyline: false,
                        }
                      }
                    /> : <></>
                  }
                  <Polygon
                    key={i}
                    data-id={1}
                    positions={n.geometry.coordinates}
                    ref={ref => mainMapRefs[i] = ref}
                    onClick={(e) => { EditPolygon(e); if (props.editModFlag) e.target.closePopup() }}
                    onEditabl_edisable={onEditEnd}
                    index={i}
                    color={(n.properties.crop_info === null) ? n.properties.crop_color : n.properties.crop_info.crop_color}
                  >
                    <Popup>
                      <p>номер реестра: {n.properties.reestr_number}</p>
                      <p>с\х культура: {(n.properties.crop_info === null) ? n.properties.crop_color : n.properties.crop_info.crop_name}</p>
                      <p>год: {n.properties.year_}</p>
                      <p>площадь: {n.properties.area}</p>
                      <button onClick={(e) => { setNDVIWinIsActivae(true); setSelectedNDVIPolygon(n) }}>
                        NDVI
                      </button>
                    </Popup>
                  </Polygon>
                </FeatureGroup>
              )}
            </LayerGroup>
          </LayersControl.Overlay>
          {props.userMapData.length ?
            <LayersControl.Overlay name="Пользовательский файл" >
              <LayerGroup>
                {props.userMapData.map((n, i) =>
                  <FeatureGroup>
                    {
                      editingUserMapPolygonId === i ? <EditControl
                        position="topright"
                        onCreated={newPolygonCreatedUserMap}
                        draw={
                          {
                            rectangle: false,
                            circle: false,
                            circlemarker: false,
                            marker: false,
                            polyline: false,
                          }
                        }
                      /> : <></>
                    }
                    <Polygon
                      key={i}
                      data-id={2}
                      positions={n.geometry.coordinates}
                      ref={ref => userMapRefs[i] = ref}
                      onEditabl_edisable={onEditEnd}
                      index={i}
                      onClick={EditUserPolygon}
                    >
                    </Polygon>
                  </FeatureGroup>

                )}
              </LayerGroup>
            </LayersControl.Overlay> :
            <></>
          }
        </LayersControl>
      </Map>
      {
        selectedNDVIPolygon.id ? <NDVIPopup active={NDVIWinIsActivae} setActive={setNDVIWinIsActivae} cropList={props.cropList} selectedPolygonData={selectedNDVIPolygon} /> : <></>
      }
    </div>
  )
}

export default MainMap;