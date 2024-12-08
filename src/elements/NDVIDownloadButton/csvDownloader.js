import React, { useState, useRef } from 'react';
import { CSVLink } from 'react-csv';
import axios from 'axios';
import "./styles.css"
import getServerAPIURL from '../serverAPI';

const downloadPolygonNDVIData = (polygonId, year, modelName, region) => {
  const [data, setData] = useState([]);
  const [header, setHeader] = useState([]);
  const csvLink = useRef();

  const getSurveyReport = async (id) => {
    try {
      var array = modelName.split(' ');
      let size = array[1];
      let version = array[2];
      let dataToLoad = []
      let headerToLoad = []

      alert("Началась загрузка данных о полигоне с сервера!!!")

      const dataLoaded = await axios.get(getServerAPIURL() + "/api/list-of-ndvi/?y=" + year + "&v=" + version + "&s=" + size + "&fi=" + polygonId + "&region=" + region)

      Object.keys(dataLoaded.data.features[0].properties).map(
        (headerKey) => {
          headerToLoad.push(
            {
              label: headerKey,
              key: headerKey
            }
          )
        }
      )
      dataLoaded.data.features.map(
        (point) => {
          dataToLoad.push(
            point.properties
          )
        }
      )
      setHeader(headerToLoad)
      setData(dataToLoad);
      csvLink.current.link.click();
    }
    catch (error) {
      alert("!!!Возникла ошибка при скачивании файла!!!")
    }
  };
  return (
    <>
      <CSVLink style={{ textDecoration: 'none' }} headers={header} data={data} filename={'id_' + polygonId + ' year_' + year + ' region_'+ region + ' model_' + modelName +'.csv'} target="_blank" ref={csvLink} separator={";"} />
      <button className='downloadButton' onClick={() => getSurveyReport(polygonId)}>Скачать в csv</button>
    </>
  );
};
export default downloadPolygonNDVIData;