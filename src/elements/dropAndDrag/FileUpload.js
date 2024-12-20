import React, { useState } from "react";
import Dropzone from "react-dropzone";
import './styles.css';
import { parseTiffFile } from "../../features/parcers/tiffParcer";

const UploadFiles = ({ selectedFiles, setSelectedFiles }) => {

  const onDrop = async (files) => {
    const filesToDeploy = selectedFiles || [];
    const updatedFiles = await Promise.all(files.map(async (file) => {
      const [type, format] = file.type.split('/');

      if (["tiff", 
        // "jp2"

      ].includes(format)) {
        try {
          const imageOverlay = await parseTiffFile(file);
          const fileWithOverlay = {
            file: file.name,
            isUsed: true,
            overlay: imageOverlay
          };
          return fileWithOverlay;
        } catch (error) {
          console.error(`Error processing file ${file.name}:`, error);
          return null;
        }
      } else {
        alert(`${file.name.split(".")[0]} - неправильный формат файла!!!`);
        return null;
      }
    }));
    const validFiles = updatedFiles.filter((file) => file !== null);
    setSelectedFiles([...filesToDeploy, ...validFiles]);
  };

  const getCorrectFileName = (fileName) => {
    let [name, format] = fileName.split('.');
    const nameMaxLength = 17;
    if (name.length > nameMaxLength) {
      name = name.slice(0, nameMaxLength - 4) + "... ";
    }
    return `${name}.${format}`;
  };

  return (
    <div>
      <Dropzone onDrop={onDrop} multiple={true}>
        {({ getRootProps, getInputProps }) => (
          <section>
            <div {...getRootProps({ className: "dropzone" })}>
              <input {...getInputProps()} />
              Перетащите файлы сюда или нажмите, чтобы выбрать файлы формата .TIF
            </div>
          </section>
        )}
      </Dropzone>
      {selectedFiles && selectedFiles.length > 0 && (
        <div className="card">
          <div className="card-header">Подгруженные файлы</div>
          <ul className="list-group list-group-flush">
            {selectedFiles.map((file, index) => (
              <li className="list-group-item" key={file.name}>
                <p>
                  {getCorrectFileName(file.file)}
                  <input
                    type="checkbox"
                    checked={file.isUsed}
                    onChange={(e) => {
                      setSelectedFiles(
                        selectedFiles.map((fileData, ind) => {
                          if (ind === index) {
                            return {
                              file: fileData.file,
                              isUsed: e.target.checked,
                              overlay: fileData.overlay
                            };
                          }
                          return fileData;
                        })
                      );
                    }}
                  />
                  <button onClick={() => {
                    setSelectedFiles(
                      selectedFiles.filter((_, ind) => ind !== index)
                    );
                  }}>X</button>
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default UploadFiles;
