const { Map: LeafletMap, TileLayer, Polygon, Popup } = ReactLeaflet;

class App extends React.Component {
  state = {
    mapOptions: {
      center: [ 43.1249, 1.254 ],
      zoom: 15,
      editable: true,
    },
    editing: null,
    polygons: [
      [
        [ 43.1292, 1.256 ],
        [ 43.1295, 1.259 ],
        [ 43.1291, 1.261 ],
      ],
      [
        [ 43.1239, 1.259 ],
        [ 43.123, 1.263 ],
        [ 43.1252, 1.265 ],
        [ 43.1250, 1.261 ],
      ],
      [
        [ 43.1239, 1.244 ],
        [ 43.123, 1.253 ],
        [ 43.1252, 1.255 ],
        [ 43.1250, 1.251 ],
        [ 43.1239, 1.244 ],
      ],
    ],
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

      // перейти к редактируемому полигону
      //this.mapRef.current.leafletElement.fitBounds(refs[index].leafletElement.getBounds());

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
    this.setState(({ polygons }) => ({
      polygons: polygons.map((n, i) => i === layer.options.index
        ? layer.getLatLngs().map(n => n.map(Object.values))
        : n
      ),
    }));
  }

  render() {
    const { polygons, editing } = this.state;
    const refs = this.polygonRefs = [];

    return (
      <div>
          <button
            className={editing !== null ? 'active' : ''}
            onClick={this.onClick1}
          >edit</button>
        <LeafletMap
          {...this.state.mapOptions}
          ref={this.mapRef}
          whenReady={this.onLoad}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; <a href=&quot;http://osm.org/copyright&quot;>OpenStreetMap</a> contributors"
          />
          {polygons.map((n, i) =>
            <Polygon
              positions={n}
              ref={ref => refs[i] = ref}
              onEditabl_edisable={this.onEditEnd}
              index={i}
            >
            <Popup>
               <button
                data-index={i}
                className={editing === i ? 'active' : ''}
                onClick={this.onClick}
                >edit #{i}</button>
            </Popup>
            </Polygon>
          )}
        </LeafletMap>
        <pre>{JSON.stringify(polygons, null, 2)}</pre>
      </div>
    );
  }
}
