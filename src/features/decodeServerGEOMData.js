import { Buffer } from 'buffer';

window.Buffer = Buffer;
var wkx = require('wkx');
// import { Feature } from 'ol';
// import GeoJSON from 'ol/format/GeoJSON.js';
// import VectorSource from 'ol/source/Vector.js';
// import { Vector as VectorLayer } from 'ol/layer.js';
// global.Buffer = global.Buffer || require('buffer').Buffer;

function geomDecoding(base64Geometry) {
    const bufferD = Buffer.from(base64Geometry, 'base64');
    // const bufferD = base64ToArrayBuffer(base64Geometry)
    const geometry = wkx.Geometry.parse(bufferD);
    const geoJSON = geometry.toGeoJSON();
    return geoJSON

    // console.log(geoJSON)
// тут я не знаю какой формат вывода нужен, поэтому я представила несколько вариантов
// на выбор, если никакой формат не подойдет, можно в любой другой переделать, я думаю
    
// // ---- формат vectorLayer из OpenLayers ----
//     const format = new GeoJSON();
//     const features = format.readFeatures(geoJSON, {
//     featureProjection: 'EPSG:3857'
//     });

//     const vectorSource = new VectorSource({
//         features: features
//       });
      
//       const vectorLayer = new VectorLayer({
//         source: vectorSource
//       });
      
//     return vectorLayer
    // console.log(vectorLayer); // думаю, что так же можно создать объект MultiPolygon

    // ---- формат WKT ----
    // const wkt = geometry.toWkt();
    // return wkt
}

// пример
// const base64String = 'AQYAACDmEAAAAQAAAAEDAAAAAQAAAD4AAAApFZK6mOdgQJLkTOwSQEhAOW+UOJvnYEDG1XQbH0BI\nQB6B0aaf52BA+cacSitASEAu29MkoudgQBDKAeg7QEhA1kpJBabnYEBEuykXSEBIQNgtarqq52BA\n1AIe0FlASEAlKjTGredgQJ0mmKxiQEhAJw1Ve7LnYEAyWepZX0BIQIRjIQW452BATUet61pASEA8\nLZljvudgQOJ5/5hXQEhAPxC6GMPnYEB3rFFGVEBIQEHz2s3H52BAk5oU2E9ASECeSadXzedgQCjN\nZoVMQEhA+59z4dLnYECviNdpS0BIQHfHI7LY52BAUjIL4EVASEB5qkRn3edgQGCp7KhDQEhAT0Wg\nDOTnYEADUyAfPkBIQJxBahjn52BAEMoB6DtASEAm4Pux6udgQBDKAeg7QEhAgzbIO/DnYECzczVe\nNkBIQKPqzDf152BASKaHCzNASECYVgwk/OdgQGSUSp0uQEhAbvFnyQLoYECccNDAJUBIQDQywfAG\n6GBAuF6TUiFASEBCqaK5BOhgQBmgvdARQEhA9azYrQHoYECXz6rg/T9IQNT407H852BAOXneVvg/\nSEBZ0SPh9udgQJfPquD9P0hAKMMcZ+/nYEB74edOAkBIQHD5pAjp52BAUXxD9AhASED10fQ34+dg\nQK7SD34OQEhA4pTRBNznYECS5EzsEkBIQKEsyAzS52BA/bH6PhZASEBRTd1LyudgQE2R5f8dQEhA\np/pGtsHnYEAxoyJuIkBIQIRjIQW452BAjvnu9ydASEBmkj2+t+dgQO86GXYYQEhA7zDPV7vnYEDK\nwNIPCkBIQDwtmWO+52BA5q6VoQVASEC4VEk0xOdgQIlYyRcAQEhArMCIIMvnYECkRoyp+z9IQPuf\nc+HS52BAwDRPO/c/SEDwC7PN2edgQOqZ85XwP0hAL5GbEN/nYEBxVWR67z9IQG4WhFPk52BAFP+X\n8Ok/SEBigsM/6+dgQCJ2ebnnP0hAdb/mcvLnYEDFH60v4j9IQDsAQJr252BA4Q1wwd0/SED+XXgM\n9udgQJ+lZsnTP0hAoQesgvDnYECfpWbJ0z9IQFIowcHo52BACnMUHNc/SECo1Sos4OdgQOENcMHd\nP0hAd8cjstjnYEA+ZDxL4z9IQPufc+HS52BAInZ5uec/SECswIggy+dgQH/MRUPtP0hAMZnYT8Xn\nYED4ENVe7j9IQLVxKH+/52BA3CISzfI/SEBWODtAtedgQB2LG8X8P0hAFNAxSKvnYEACnVgzAUBI\nQAKTDhWk52BAX/MkvQZASECzsyNUnOdgQEMFYisLQEhAKRWSupjnYECS5EzsEkBIQA=='

// console.log(geomDecoding(base64String));

export default geomDecoding;