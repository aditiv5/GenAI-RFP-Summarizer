import React, { useState } from 'react';
import pdfIcon from '../assets/icons/pdf.svg';
import docIcon from '../assets/icons/doc.svg';
import imageIcon from '../assets/icons/image.svg';
import unknownIcon from '../assets/icons/unknown.svg';

const getFileIcon = (type) => {
  switch (type) {
    case 'pdf':
      return pdfIcon;
    case 'doc':
    case 'docx':
      return docIcon;
    case 'image':
      return imageIcon;
    default:
      return unknownIcon;
  }
};

// Function to determine file type from the URL
const getFileType = (url) => {
  if (!url) return 'unknown'; // Return 'unknown' if the URL is not defined

  // Extract the part of the URL before query parameters
  const urlWithoutParams = url.split('?')[0];
  
  // Extract the file name from the URL
  const fileName = urlWithoutParams.split('/').pop();
  
  // Find the last occurrence of a dot in the file name
  const lastDotIndex = fileName.lastIndexOf('.');
  
  // Extract the extension
  const extension = lastDotIndex !== -1 ? fileName.slice(lastDotIndex + 1).toLowerCase() : 'unknown';

  return ['pdf', 'doc', 'docx', 'image'].includes(extension) ? extension : 'unknown';
};

// DocumentList component
const DocumentList = ({ documents, onUpload, selectedDocumentId, setSelectedDocumentId, isLoggedIn }) => {
  const [file, setFile] = useState(null);

  // Handle file selection
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  };

  // Handle file upload
  const handleFileUpload = () => {
    if (file) {
      onUpload(file);
      setFile(null); // Reset the file state after upload
    }
  };

  // Separate documents into new and previously uploaded
  const newlyUploadedDocs = documents.filter(doc => doc.unique_id);
  const previouslyUploadedDocs = documents.filter(doc => !doc.unique_id);

  return (
    <div className="bg-dark-navy p-6 w-full lg:w-2/5 rounded-lg shadow-lg mx-auto">
      <h3 className="text-3xl text-black mb-4">Documents</h3>
      <p className="text-black mb-6">Select or upload a document to begin summarizing</p>

      {/* File Upload Section */}
      <div className="mb-6 flex flex-col space-y-2 w-full">
        <input
          type="file"
          onChange={handleFileChange}
          accept=".pdf,.doc,.docx"  // Accept only PDF, DOC, and DOCX files
          className="file-input bg-gray-700 text-gray-200 py-3 px-4 rounded-lg shadow-inner focus:outline-none w-full"
        />
        <button
          onClick={handleFileUpload}
          className={`bg-gradient-to-r from-[#22639c] to-[#009ca7] text-white py-3 px-4 rounded-lg hover:from-[#009ca7] hover:to-light-navy transition duration-300 shadow-lg w-full`}
        >
          Upload Document
        </button>
      </div>

      {/* Newly Uploaded Documents */}
      {newlyUploadedDocs.length > 0 && (
        <>
          <h4 className="text-xl text-gray-400 mb-2">Newly Uploaded Documents</h4>
          <ul className="space-y-6">
            {newlyUploadedDocs.map((document) => (
              <li
                key={document.id}
                onClick={() => setSelectedDocumentId(document.id)}
                className={`flex flex-col items-center p-5 bg-gray-800 text-gray-300 rounded-lg cursor-pointer hover:bg-accent-blue transition-all duration-200 shadow-md hover:shadow-xl w-11/12 mx-auto transform hover:-translate-y-1 ${selectedDocumentId === document.id ? 'bg-accent-blue' : ''}`}
              >
                <img
                  src={getFileIcon(getFileType(document.url))}
                  alt={`${document.type} icon`}
                  className="w-16 h-16 mb-4"
                />
                <span className="text-center text-lg font-semibold">{document.name}</span>
              </li>
            ))}
          </ul>
        </>
      )}

      {/* Previously Uploaded Documents with Scrollbar */}
      {previouslyUploadedDocs.length > 0 && (
        <>
          <h4 className="text-xl text-gray-400 mb-2">Previously Uploaded Documents</h4>
          {/*<div className="overflow-y-auto h-64"> {/* Added scrollbar and height */}
          <div className=" md:overflow-x-hidden md:overflow-y-auto">
            <div className="      max-h-[80vh] border-primary lg:border-r border-opacity-20  gap-4    lg:pr-4 overflow-auto">
            <ul className="space-y-6 mb-6">
              {previouslyUploadedDocs.map((document) => (
                <li
                  key={document.id}
                  onClick={() => setSelectedDocumentId(document.id)}
                  className={`flex flex-col items-center p-5 bg-gray-800 text-gray-300 rounded-lg cursor-pointer hover:bg-accent-blue transition-all duration-200 shadow-md hover:shadow-xl w-11/12 mx-auto transform hover:-translate-y-1 ${selectedDocumentId === document.id ? 'bg-accent-blue' : ''}`}
                >
                  <img
                    src={getFileIcon(getFileType(document.url))}
                    alt={`${document.type} icon`}
                    className="w-16 h-16 mb-4"
                  />
                  <span className="text-center text-lg font-semibold">{document.name}</span>
                </li>
              ))}
            </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DocumentList;
