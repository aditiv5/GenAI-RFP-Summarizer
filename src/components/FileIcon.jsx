import React from 'react';

const FileIcon = ({ type }) => {
  if (type.includes('pdf')) {
    return <i className="fas fa-file-pdf text-red-500 text-3xl"></i>;
  } else if (type.includes('doc') || type.includes('docx')) {
    return <i className="fas fa-file-word text-blue-500 text-3xl"></i>;
  } else if (type.includes('image')) {
    return <i className="fas fa-file-image text-green-500 text-3xl"></i>;
  } else {
    return <i className="fas fa-file text-gray-500 text-3xl"></i>;
  }
};

export default FileIcon;
