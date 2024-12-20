import React, { useEffect, useState } from "react";
import "./NDVIPopup.css"
import axios from "axios";
import getServerAPIURL from "../../features/serverAPI.js"
import { Map, TileLayer, Polygon, LayerGroup, LayersControl, Circle, Popup } from "react-leaflet";
import { Chart as ChartJS } from 'chart.js/auto'
import { Line } from "react-chartjs-2";
import { Tabs, TabItem } from "../../elements/tabScroll/tabScroll.js";
import Legend from "../../elements/mapLegend/mapLegend.js"
import geomDecoding from '../../features/decodeServerGEOMData.js';
import NDVIMap from "../NDVIMap/NDVIMap.js";
import downloadPolygonNDVIData from "../../elements/NDVIDownloadButton/csvDownloader.js";

const NDVIPopup = ({ active, setActive, cropList, selectedPolygonData, selectedYear, selectedRegion }) => {
  const NDVITypes = [
    { value: "NDVI 20 1", label: "NDVI 20 1" },
    { value: "NDVI 20 2", label: "NDVI 20 2" },
    { value: "NDVI 10 1", label: "NDVI 10 1" },
    { value: "NDVI 30 1", label: "NDVI 30 1" },
    { value: "NDVI 30 2", label: "NDVI 30 2" }
  ];
  const [lastPolygonData, setLastPolygonData] = useState({ "id": -1 });
  const [NDVI201points, setNDVI201points] = useState([]);
  const [lineDataNDVI201, setLineDataNDVI201] = useState({
    labels: getLabelsG(),
    datasets: [
      {
        data: getDefaultDataG(),
        label: "NDVI 20 1",
        borderColor: "#3333ff",
        fill: true,
        lineTension: 0.5
      }
    ]
  });
  const [NDVI202points, setNDVI202points] = useState([]);
  const [lineDataNDVI202, setLineDataNDVI202] = useState({
    labels: getLabelsG(),
    datasets: [
      {
        data: getDefaultDataG(),
        label: "NDVI 20 2",
        borderColor: "#3333ff",
        fill: true,
        lineTension: 0.5
      }
    ]
  });
  const [NDVI101points, setNDVI101points] = useState([]);
  const [lineDataNDVI101, setLineDataNDVI101] = useState({
    labels: getLabelsG(),
    datasets: [
      {
        data: getDefaultDataG(),
        label: "NDVI 10 1",
        borderColor: "#3333ff",
        fill: true,
        lineTension: 0.5
      }
    ]
  });

  const [NDVI301points, setNDVI301points] = useState([]);
  const [lineDataNDVI301, setLineDataNDVI301] = useState({
    labels: getLabelsG(),
    datasets: [
      {
        data: getDefaultDataG(),
        label: "NDVI 30 1",
        borderColor: "#3333ff",
        fill: true,
        lineTension: 0.5
      }
    ]
  });

  const [NDVI302points, setNDVI302points] = useState([]);
  const [lineDataNDVI302, setLineDataNDVI302] = useState({
    labels: getLabelsG(),
    datasets: [
      {
        data: getDefaultDataG(),
        label: "NDVI 30 2",
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
        loadNDVIModelData(setLineDataNDVI201, setNDVI201points, 20, 1)
        loadNDVIModelData(setLineDataNDVI202, setNDVI202points, 20, 2)
        loadNDVIModelData(setLineDataNDVI101, setNDVI101points, 10, 1)
        loadNDVIModelData(setLineDataNDVI301, setNDVI301points, 30, 1)
        loadNDVIModelData(setLineDataNDVI302, setNDVI302points, 30, 2)
        setLastPolygonData(selectedPolygonData)
        // axios.get("https://abgggc.ru/api/v2/get-ndvi/?year=2021&size=20&version=1&id_field=121").then(res=>console.log(res.data.data))
      }
    }
  )

  function loadNDVIModelData(setLineDataNDVIModel, setNDVIModelPoints, modelSize, modelVersion) {
    let urlReq1 = getServerAPIURL() + "/api/v2/get-ndvi/?year=" + selectedYear + "&size=" + modelSize + "&version=" + modelVersion + "&id_field=" + selectedPolygonData.id + "&region=" + selectedRegion
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
      let urlReq2 = getServerAPIURL() + "/api/v2/get-ndvi-mean/?year=" + selectedYear + "&version=" + modelVersion + "&size=" + modelSize + "&id_field=" + selectedPolygonData.id + "&region=" + selectedRegion
      axios.get(
        urlReq2
        , {
          headers: {
            "Content-type": "application/json"
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

  function getPointsSize(selectedModel) {
    switch (selectedModel) {
      case 'NDVI 20 1':
        return 10;
      case 'NDVI 10 1':
        return 5;
      case 'NDVI 20 2':
        return 10;
      case 'NDVI 30 2':
        return 15;
      case 'NDVI 30 1':
        return 15;
      default:
        return 5;
    }
  }

  function getPointsToRender() {
    switch (selectedModel) {
      case 'NDVI 20 1':
        return NDVI201points;
      case 'NDVI 10 1':
        return NDVI101points;
      case 'NDVI 20 2':
        return NDVI202points;
      case 'NDVI 30 2':
        return NDVI302points;
      case 'NDVI 30 1':
        return NDVI301points;
      default:
        return NDVI201points;
    }
  }

  function getChartData() {
    switch (selectedModel) {
      case 'NDVI 20 1':
        return lineDataNDVI201;
      case 'NDVI 10 1':
        return lineDataNDVI101;
      case 'NDVI 20 2':
        return lineDataNDVI202;
      case 'NDVI 30 2':
        return lineDataNDVI302;
      case 'NDVI 30 1':
        return lineDataNDVI301;
      default:
        return lineDataNDVI201;
    }
  }

  const renderPoints = () => {
    return <div>
      {
        getPointsToRender().map(
          (point, ind) =>
            <Circle
              key={ind}
              center={[point.geom.coordinates[1], point.geom.coordinates[0]]}
              radius={getPointsSize(selectedModel)}
              color={getColor(point.id_crop_pixel_result)}
              fillOpacity={0.7}
            />
        )
      }
    </div>
  }
  return (
    <div className={active ? "modal active" : "modal"} onClick={() => setActive(false)}>
      <div className="modal__content" onClick={e => e.stopPropagation()}>
        <div className="buttonsBlock">
          {selectedPolygonData.id && downloadPolygonNDVIData(selectedPolygonData.id, selectedYear, selectedModel, selectedRegion)}
          <select onChange={UpdateModel} className="selectButton">
            {NDVITypes.map(({ value, label }, index) => <option value={value}>{label}</option>)}
          </select>
        </div>
        <Tabs
          selectedTab={"Карта"}
          tabs={[
            {
              title: "Карта",
              active: true,
              content:
                <div style={{ height: '90%' }}>
                  <NDVIMap
                    cropList={cropList}
                    points={renderPoints()}
                    selectedPolygonData={selectedPolygonData}
                  />
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
                        display: true,
                        position: "top" 
                      }
                    }}
                    data={getChartData()}
                  />
                </div>
            },
          ]} />
      </div>
    </div>
  );
}

export default NDVIPopup;