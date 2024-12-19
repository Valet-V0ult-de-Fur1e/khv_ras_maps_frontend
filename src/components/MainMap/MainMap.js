import React, { useEffect, useState } from "react"
import { Map, TileLayer, FeatureGroup, Polygon, Popup, LayerGroup, LayersControl, ImageOverlay } from "react-leaflet";
import "leaflet-editable";
import { EditControl } from "react-leaflet-draw";
import NDVIPopup from "../NDVIPopup/NDVIPopup.js"
import Legend from "../../elements/mapLegend/mapLegend.js"
import "./styles.css"
import axios from "axios";
import getServerAPIURL from "../../features/serverAPI.js";
import { parseTiffFile } from "../../elements/tiffParcer/tiffParcer.js";

let mainMapData = [];
let userMapData = [];

const MainMap = (props) => {
  const mapOptions = props.zoomConfig
  const [editingMainMapPolygonId, setEditingMainMapPolygonId] = useState(null);
  const [editingUserMapPolygonId, setEditingUserMapPolygonId] = useState(null);

  const [NDVIWinIsActivae, setNDVIWinIsActivae] = useState(false);
  const [selectedNDVIPolygon, setSelectedNDVIPolygon] = useState({});

  const [selectedPolygonData, setSelectedPolygonData] = useState({
    "comment": "",
    "area": "",
    "id_crop_sort_plan": null,
    "id_crop_sort_fact": null,
  });

  const [selectedPolygonID, setSelectedPolygonID] = useState(-1);
  const [lastSelectedPolygonID, setLastSelectedPolygonID] = useState(-1);

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

  function getColor(dataCropID) {
    if (dataCropID === null || dataCropID === undefined) return "black"
    return props.cropList.filter(item => item.id === dataCropID)[0].crop_color
  }

  function getCropPlan(cropPlanID) {
    let cropPlan = props.cropList.filter(item => item.id === cropPlanID)[0];
    return cropPlan === undefined ? "-" : cropPlan.crop_name
  }

  function getCropFact(cropFlagID) {
    let cropFact = props.cropList.filter(item => item.id === cropFlagID)[0];
    return cropFact === undefined ? "-" : cropFact.crop_name
  }

  useEffect(
    () => {
      if (lastSelectedPolygonID !== selectedPolygonID) {
        setLastSelectedPolygonID(selectedPolygonID)
        axios.get(getServerAPIURL() + "/api/v2/get-field-info/?id_field=" + selectedPolygonID + "&year=" + props.selectedYear).then(
          (response) => {
            setSelectedPolygonData(response.data.data[0]);
          }
        )
      }
    }
  )

  const handleLayerCreated = (dataUrl, bounds) => {
    const imageOverlay = L.imageOverlay(dataUrl, bounds);
    imageOverlay.addTo(mapRef.current);
  };

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
            {props.selectedImageData && props.selectedImageData.map((overlay, index) => {
              if (overlay.isUsed) return <ImageOverlay key={index} url={overlay.overlay.imageUrl} bounds={overlay.overlay.bounds} opacity={0.8} />
            })}
            <LayerGroup>
              {props.data.map((n, i) =>
                <FeatureGroup key={i}>
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
                    positions={n.geom.coordinates}
                    ref={ref => mainMapRefs[i] = ref}
                    onClick={(e) => {
                      setSelectedPolygonID(n.id);
                      if (props.editModFlag) {
                        e.target.closePopup();
                        EditPolygon(e);
                      }
                    }}
                    onEditabl_edisable={onEditEnd}
                    index={i}
                    color={getColor(n.id_crop_fact)}
                    fillOpacity={0.4}
                  >
                    <Popup>
                      {
                        n.id === selectedPolygonID ? selectedPolygonData && <div>
                          <p>Описание: {selectedPolygonData.comment}</p>
                          <p>Площадь: {selectedPolygonData.area}</p>
                          <p>Культура план: {getCropPlan(selectedPolygonData.id_crop_plan)}</p>
                          <p>Культура факт: {getCropFact(n.id_crop_fact)}</p>
                          <p>Год:{props.selectedYear}</p>
                        </div> :
                          <div></div>
                      }
                      <button className="classic-btn sidebar__btn-filter" onClick={(e) => { setNDVIWinIsActivae(true); setSelectedNDVIPolygon(n) }}>
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
                      fillOpacity={0.4}
                    >
                    </Polygon>
                  </FeatureGroup>

                )}
              </LayerGroup>
            </LayersControl.Overlay> :
            <></>
          }
        </LayersControl>
        {props.cropList.length > 0 ? <Legend cropList={props.cropList} /> : <></>}
      </Map>
      {
        selectedNDVIPolygon.id ? <NDVIPopup active={NDVIWinIsActivae} setActive={setNDVIWinIsActivae} cropList={props.cropList} selectedPolygonData={selectedNDVIPolygon} selectedYear={props.selectedYear} selectedRegion={props.selectedRegion} /> : <></>
      }
    </div>
  )
}

export default MainMap;