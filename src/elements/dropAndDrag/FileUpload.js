import React, { useState } from "react";
import Dropzone from "react-dropzone";
import './styles.css';
import { parseTiffFile } from "../tiffParcer/tiffParcer";

const UploadFiles = ({ selectedFiles, setSelectedFiles }) => {

  const onDrop = async (files) => {
    const filesToDeploy = selectedFiles || []; // Start with previously selected files or an empty array

    // Use Promise.all to process all dropped files asynchronously
    const updatedFiles = await Promise.all(files.map(async (file) => {
      const [type, format] = file.type.split('/');

      if (["tiff", 
        // "jp2"

      ].includes(format)) {
        try {
          // Call parseTiffFile to process the image and get the overlay
          const imageOverlay = await parseTiffFile(file);

          // Add overlay to the file object directly
          const fileWithOverlay = {
            file,
            isUsed: true,
            overlay: imageOverlay // Attach the parsed overlay (imageUrl and bounds)
          };

          return fileWithOverlay; // Return the file with overlay attached
        } catch (error) {
          // Handle any error during TIFF parsing
          console.error(`Error processing file ${file.name}:`, error);
          return null;
        }
      } else {
        // Alert if the file format is not supported
        alert(`${file.name.split(".")[0]} - неправильный формат файла!!!`);
        return null;
      }
    }));

    // Filter out any null values (invalid files)
    const validFiles = updatedFiles.filter((file) => file !== null);

    // Update the selected files state with the new files (with overlays)
    setSelectedFiles([...filesToDeploy, ...validFiles]); // Merge old and new files
  };

  // Helper function to format the file name for display
  const getCorrectFileName = (fileName) => {
    let [name, format] = fileName.split('.');
    const nameMaxLength = 17; // Max length for the file name
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

      {/* Display selected files if any */}
      {selectedFiles && selectedFiles.length > 0 && (
        <div className="card">
          <div className="card-header">Подгруженные файлы</div>
          <ul className="list-group list-group-flush">
            {selectedFiles.map((file, index) => (
              <li className="list-group-item" key={file.file.name}>
                <p>
                  {getCorrectFileName(file.file.name)}
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
                              overlay: fileData.overlay // Keep the overlay intact
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
