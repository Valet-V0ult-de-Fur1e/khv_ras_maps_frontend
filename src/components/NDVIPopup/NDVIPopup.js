import React, { useEffect, useState } from "react";
import "./NDVIPopup.css"
import axios from "axios";
import getServerAPIURL from "../../elements/serverAPI.js"
import { Map, TileLayer, Polygon, LayerGroup, LayersControl, Circle, Popup } from "react-leaflet";
import { Chart as ChartJS } from 'chart.js/auto'
import { Line } from "react-chartjs-2";
import { Tabs, TabItem } from "../../elements/tabScroll/tabScroll.js";
import Legend from "../../elements/mapLegend/mapLegend.js"

const NDVIPopup = ({ active, setActive, cropList, selectedPolygonData }) => {
  const NDVITypes = [
    {value: "NDVI 20", label: "NDVI 20"},
    {value: "NDVI 10", label: "NDVI 10"}
  ];
  const [savedSelectedPolygonData, setSavedSelectedPolygonData] = useState({});
  const [NDVI20points, setNDVI20points] = useState(getDataNDVI20());
  const [lineDataNDVI20, setLineDataNDVI20] = useState({})
  const [NDVI10points, setNDVI10points] = useState(getDataNDVI10());
  const [lineDataNDVI10, setLineDataNDVI10] = useState({})
  const [selectedModel, setSelectedModel] = useState(NDVITypes[0]);

  function getLabelsG() {
    let graphLabels = [];
    for (var ind = 1; ind <= 52; ind++) {
      graphLabels.push("" + ind);
    }
    return graphLabels;
  }

  function getDataG(points) {
    let graphLabels = [];
    for (var ind = 1; ind <= 52; ind++) {
      graphLabels.push(0);
    }
    let pointsCount = 0;
    points.map(
      (point) => {
        pointsCount ++;
        for (var ind = 1; ind <= 52; ind++) {
          graphLabels[ind - 1] = graphLabels[ind - 1] + point.properties["ndv" + ind];
        }
      }
    )
    for (var ind = 1; ind <= 52; ind++) {
      graphLabels[ind - 1] = graphLabels[ind - 1] / pointsCount;
    }
    return graphLabels
  }

  function getDataNDVI10() {
    if (selectedPolygonData.id !== undefined && (selectedPolygonData.id !== savedSelectedPolygonData.id)) {
      axios.get(getServerAPIURL() + "/api/list-of-ndvi/?y=" + selectedPolygonData.properties.year_ + "&v=1&s=10&fi=" + selectedPolygonData.id)
        .then((res) => {
          setLineDataNDVI10({
            labels: getLabelsG(),
            datasets: [
              {
                data: getDataG(res.data.features),
                label: "NDVI 10",
                borderColor: "#3333ff",
                fill: true,
                lineTension: 0.5
              }
            ]
          })
          setNDVI10points(res.data.features);
          setSavedSelectedPolygonData(selectedPolygonData);
          return res.data.features
        })
        .catch((error) => {
          console.log(error)
        })
    }
    return []
  }

  function getDataNDVI20() {
    if (selectedPolygonData.id !== undefined && (selectedPolygonData.id !== savedSelectedPolygonData.id)) {
      axios.get(getServerAPIURL() + "/api/list-of-ndvi/?y=" + selectedPolygonData.properties.year_ + "&v=1&s=20&fi=" + selectedPolygonData.id)
        .then((res) => {
          console.log(lineDataNDVI20);
          setLineDataNDVI20({
            labels: getLabelsG(),
            datasets: [
              {
                data: getDataG(res.data.features),
                label: "NDVI 20",
                borderColor: "#3333ff",
                fill: true,
                lineTension: 0.5
              }
            ]
          })
          setNDVI20points(res.data.features);
          setSavedSelectedPolygonData(selectedPolygonData);
          return res.data.features
        })
        .catch((error) => {
          console.log(error)
        })
    }
    return []
  }

  function getColor(data) {
    // console.log(data)
    if (data === undefined) return "black"
    return data.crop_color
  }

  function UpdateModel(e) {
    setSelectedModel(e.target.value)
  }

  return (
    <div className={active ? "modal active" : "modal"} onClick={() => setActive(false)}>
      <div className="modal__content" onClick={e => e.stopPropagation()}>
        <div></div>
        <select onChange={UpdateModel} className="selecterButton">
          {NDVITypes.map(({value, label}, index) => <option value={value}>{label}</option>)}
        </select>
        <Tabs
          selectedTab={"Карта"}
          tabs={[
            {
              title: "Карта",
              content: <div style={{ height: '90%' }}>
                <Map
                  {...{
                    center: selectedPolygonData.geometry.coordinates[0][0][0],
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
                    positions={selectedPolygonData.geometry.coordinates[0]}
                    color={(selectedPolygonData.properties.crop_info === null) ? selectedPolygonData.properties.crop_color : selectedPolygonData.properties.crop_info.crop_color}
                    fillOpacity={0.5}
                  >
                    <Popup>
                      <p>номер реестра: {selectedPolygonData.properties.reestr_number}</p>
                      <p>с\х культура: {(selectedPolygonData.properties.crop_info === null) ? selectedPolygonData.properties.crop_color : selectedPolygonData.properties.crop_info.crop_name}</p>
                      <p>год: {selectedPolygonData.properties.year_}</p>
                      <p>площадь: {selectedPolygonData.properties.area}</p>
                    </Popup>
                  </Polygon>
                  {
                    (selectedModel == "NDVI 20" ? NDVI20points : NDVI10points).map(
                      (point) =>
                        <Circle
                          center={{ lat: point.geometry.coordinates[1], lng: point.geometry.coordinates[0] }}
                          radius={(selectedModel == "NDVI 20" ? 10 : 5)}
                          color={getColor(cropList.filter(crop => crop.id === point.properties.id_crop_pixel_result)[0])}
                          fillOpacity={0.7}
                        />
                    )
                  }
                  {cropList.length > 0 ? <Legend cropList={cropList}/> : <></>}
                </Map>
              </div>,
              visible: true
            },
            {
              title: "График NDVI",
              content: <div>
                {
                  savedSelectedPolygonData.id ? <div>
                    <Line
                      type="line"
                      width={160}
                      height={60}
                      options={{
                        title: {
                          display: true,
                          text: "график " + selectedModel,
                          fontSize: 20
                        },
                        legend: {
                          display: true, //Is the legend shown?
                          position: "top" //Position of the legend.
                        }
                      }}
                      data={(selectedModel == "NDVI 20" ? lineDataNDVI20 : lineDataNDVI10)}
                    /> </div>
                    :
                    <></>
                }
              </div>,
              visible: true
            }
          ]}
        />
      </div>
    </div>
  );
}

export default NDVIPopup;