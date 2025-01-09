import React, { useState, useEffect } from 'react';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import mammoth from 'mammoth';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout';
import '@react-pdf-viewer/default-layout/lib/styles/index.css';

const Modal = ({ documentUrl, documentType, onClose, documentName }) => {
  const defaultLayoutPluginInstance = defaultLayoutPlugin();
  const [docContent, setDocContent] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Effect to fetch and render the document when the component mounts or documentUrl/documentType changes
  useEffect(() => {
    const fetchDocument = async () => {
      setLoading(true); // Set loading to true while fetching
      try {
        if (documentType === 'docx') {
          const response = await fetch(documentUrl);
          const arrayBuffer = await response.arrayBuffer();
          const result = await mammoth.convertToHtml({ arrayBuffer });
          setDocContent(result.value);
        }
        setLoading(false);
      } catch (err) {
        setError('Error fetching or rendering the document.');
        setLoading(false);
      }
    };

    if (documentType === 'docx' || documentType === 'pdf' || documentType === 'image') {
      fetchDocument();
    } else {
      setLoading(false);
    }
  }, [documentUrl, documentType]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-md transition-opacity duration-300 ease-in-out"
      style={{ animation: 'fadeIn 0.3s ease-in-out' }}
    >
      <div className="relative bg-dark-navy p-6 rounded-lg shadow-2xl w-full max-w-6xl h-full sm:h-4/5 lg:h-5/6 flex flex-col overflow-hidden animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-white">
            Preview: {documentName}
          </h2>
          <button
            className="text-red-500 hover:text-red-300 focus:outline-none"
            onClick={onClose}
            aria-label="Close preview"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="flex-grow overflow-auto p-4 bg-gray-800 rounded-md shadow-inner">
          {loading && <div className="text-white">Loading...</div>}

          {documentType === 'pdf' && (
            <Worker workerUrl="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js">
              <Viewer fileUrl={documentUrl} plugins={[defaultLayoutPluginInstance]} />
            </Worker>
          )}

          {documentType === 'docx' && docContent && !loading && (
            <div
              className="doc-preview bg-white text-black p-4"
              dangerouslySetInnerHTML={{ __html: docContent }}
            />
          )}

          {documentType === 'image' && (
            <div className="flex justify-center">
              <img src={documentUrl} alt={documentName} className="max-w-full max-h-full rounded-md shadow-lg" />
            </div>
          )}

          {error && <p className="text-red-500">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default Modal;
