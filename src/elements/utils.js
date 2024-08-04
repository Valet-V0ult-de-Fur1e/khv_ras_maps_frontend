import shp from "shpjs";

const extractShapes = async (files) => {
  let result = {
    hasError: false,
    errorMessage: null,
    data: null
  };

  const _formatShape = (_data) => {
    return _data.features;
  };

  const _parseFile = async (_file) => {
    let _result = {
      hasError: false,
      errorMessage: null,
      data: null
    };

    let _data = await _file
      .arrayBuffer()
      .then((_buffer) => shp(_buffer))
      .catch((_err) => {
        console.error(_err);
        _result.hasError = true;
        _result.errorMessage = "IMPORT_UNRECOGNISED_FILE";
        return null;
      });

    _result.data = _formatShape(_data);

    // console.log(_formatShape(_data));

    if (_result.hasError) return _result;

    if (!_result.data || _result.data.length < 1) {
      _result.hasError = true;
      _result.errorMessage = "EXTRACT_FILE_EMPTY";
    }

    return _result;
  };

  // read the files
  result.data = await Promise.all(
    Array.prototype.map.call(files, _parseFile)
  ).catch((err) => {
    console.error(err);
    result.hasError = true;
    result.errorMessage = "Extract went wrong";
    return null;
  });

  if (result.hasError) return result;

  if (!result.data || result.data.length < 1) {
    result.hasError = true;
    result.errorMessage = "IMPORT_SHAPE_EMPTY";
  }

  return result.data[0].data;
};

export { extractShapes };
