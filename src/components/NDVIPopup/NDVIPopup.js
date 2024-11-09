import React, { useEffect, useState } from "react";
import "./NDVIPopup.css"
import axios from "axios";
import getServerAPIURL from "../../elements/serverAPI.js"
import { Map, TileLayer, Polygon, LayerGroup, LayersControl, Circle, Popup } from "react-leaflet";
import { Chart as ChartJS } from 'chart.js/auto'
import { Line } from "react-chartjs-2";
import { Tabs, TabItem } from "../../elements/tabScroll/tabScroll.js";
import Legend from "../../elements/mapLegend/mapLegend.js"
import geomDecoding from '../../elements/decodeServerGEOMData.js';

const NDVIPopup = ({ active, setActive, cropList, selectedPolygonData, selectedYear }) => {
  const NDVITypes = [
    { value: "NDVI 20", label: "NDVI 20" },
    { value: "NDVI 10", label: "NDVI 10" }
  ];
  const [lastPolygonData, setLastPolygonData] = useState({ "id": -1 });
  const [NDVI20points, setNDVI20points] = useState([]);
  const [lineDataNDVI20, setLineDataNDVI20] = useState({
    labels: getLabelsG(),
    datasets: [
      {
        data: getDefaultDataG(),
        label: "NDVI 20",
        borderColor: "#3333ff",
        fill: true,
        lineTension: 0.5
      }
    ]
  });
  const [NDVI10points, setNDVI10points] = useState([]);
  const [lineDataNDVI10, setLineDataNDVI10] = useState({
    labels: getLabelsG(),
    datasets: [
      {
        data: getDefaultDataG(),
        label: "NDVI 10",
        borderColor: "#3333ff",
        fill: true,
        lineTension: 0.5
      }
    ]
  });
  const [selectedModel, setSelectedModel] = useState(NDVITypes[0].value);
  const [legendNDVIMap, setLegendNDVIMap] = useState([{
    "crop_name": "null",
    "crop_color": " #000000"
  }]);

  function getLabelsG() {
    let graphLabels = [];
    for (var ind = 1; ind <= 52; ind++) {
      graphLabels.push("" + ind);
    }
    return graphLabels;
  }

  function getDefaultDataG() {
    let graphLabels = [];
    for (var ind = 1; ind <= 52; ind++) {
      graphLabels.push(0);
    }
    return graphLabels
  }

  useEffect(
    () => {
      if (lastPolygonData.id !== selectedPolygonData.id) {
        setLegendNDVIMap([{
          "crop_name": "null",
          "crop_color": " #000000"
        }]);
        loadNDVIModelData(setLineDataNDVI20, setNDVI20points, 20, 1)
        loadNDVIModelData(setLineDataNDVI10, setNDVI10points, 10, 1)
        setLastPolygonData(selectedPolygonData)
        // axios.get("https://abgggc.ru/api/v2/get-ndvi/?year=2021&size=20&version=1&id_field=121").then(res=>console.log(res.data.data))
      }
    }
  )

  function loadNDVIModelData(setLineDataNDVIModel, setNDVIModelPoints, modelSize, modelVersion) {
    let urlReq1 = getServerAPIURL() + "/api/v2/get-ndvi/?year=" + selectedYear + "&size=" + modelSize + "&version=" + modelVersion + "&id_field=" + selectedPolygonData.id
    let haveData = true
    axios.get(
      urlReq1
      , {
        headers: {
          "Content-type": "application/json",
          // "Access-Control-Allow-Origin": "*"
        }
      }
    )
      .then(
        (req1Result) => {
          if (req1Result.data.data.length === 0) haveData = false;
          let fixedModelPoints = []
          let findedCropIDList = [{
            "crop_name": "null",
            "crop_color": " #000000"
          }]
          req1Result.data.data.map((pointData) => {
            let findedType = cropList.filter(crop => crop.id === pointData.id_crop_pixel_result)[0]
            if (findedType !== undefined && findedCropIDList.find((element) => element['crop_name'] == findedType.crop_name) === undefined) {
              findedCropIDList.push(
                {
                  "crop_name": cropList.filter(crop => crop.id === pointData.id_crop_pixel_result)[0]["crop_name"],
                  "crop_color": cropList.filter(crop => crop.id === pointData.id_crop_pixel_result)[0]["crop_color"]
                }
              )
            }
            fixedModelPoints.push(
              {
                "geom": geomDecoding(pointData.geom),
                "id_crop_pixel_result": pointData.id_crop_pixel_result
              }
            )
          })
          if (findedCropIDList.length > 1) {
            setLegendNDVIMap(findedCropIDList)
          }
          setNDVIModelPoints(fixedModelPoints)
        }
      )
    if (haveData) {
      let urlReq2 = getServerAPIURL() + "/api/v2/get-ndvi-mean/?year=" + selectedYear + "&version=" + modelVersion + "&size=" + modelSize + "&id_field=" + selectedPolygonData.id
      axios.get(
        urlReq2
        , {
          headers: {
            "Content-type": "application/json",
            // "Access-Control-Allow-Origin": "*"
          }
        }
      )
        .then(
          (req2Result) => {
            setLineDataNDVIModel(
              {
                labels: Object.keys(req2Result.data.data[0]),
                datasets: [
                  {
                    data: Object.values(req2Result.data.data[0]),
                    label: "NDVI " + modelSize,
                    borderColor: "#3333ff",
                    fill: true,
                    lineTension: 0.5
                  }
                ]
              }
            )
          }
        )
    }
  }

  function getColor(objectCropId) {
    if (objectCropId === null) return "black"
    return cropList.filter(item => item.id === objectCropId)[0].crop_color
  }

  function UpdateModel(e) {
    setSelectedModel(e.target.value)
  }

  return (
    <div className={active ? "modal active" : "modal"} onClick={() => setActive(false)}>
      <div className="modal__content" onClick={e => e.stopPropagation()}>
        <div></div>
        <select onChange={UpdateModel} className="selecterButton">
          {NDVITypes.map(({ value, label }, index) => <option value={value}>{label}</option>)}
        </select>
        <Tabs
          selectedTab={"Карта"}
          tabs={[
            {
              title: "Карта",
              active: true,
              content:
                <div style={{ height: '90%' }}>
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
                      positions={selectedPolygonData.geom.coordinates}
                      color={getColor(selectedPolygonData.id_crop_fact)}
                      fillOpacity={0.5}
                    >
                    </Polygon>
                    {
                      (selectedModel == "NDVI 20" ? NDVI20points : NDVI10points).map(
                        (point) =>
                          <Circle
                            center={point.geom.coordinates.reverse()}
                            radius={(selectedModel == "NDVI 20" ? 10 : 5)}
                            color={getColor(point.id_crop_pixel_result)}
                            fillOpacity={0.7}
                          />
                      )
                    }
                    <Legend cropList={legendNDVIMap} />
                  </Map>
                </div>,
            },
            {
              title: "График NDVI",
              active: false,
              content:
                <div>
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
                  />
                </div>
            },
          ]} />
      </div>
    </div>
  );
}

export default NDVIPopup;