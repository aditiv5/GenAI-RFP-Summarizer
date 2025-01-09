import React from 'react';

const Header = () => {
  return (
    //<header className="bg-gradient-to-r from-[#22639c] to-[#009ca7] p-8 shadow-lg flex flex-col sm:flex-row items-center">
    <header className="bg-gradient-to-r bg-[#22639c] p-8 shadow-lg flex flex-col sm:flex-row items-center">
      <img
        src="dashboard/images/CT_logo_horizontal.svg"
        alt="cloudthat logo"
        className="absolute top-8 left-8 w-25 h-12"
      />
      <div className="flex flex-col items-center w-full">
        <h1 className="text-white text-3xl sm:text-4xl lg:text-5xl font-extrabold text-center tracking-wider drop-shadow-lg">
          RFP/EOI Summarizer
        </h1>
        <p className="text-gray-200 text-center mt-2 sm:mt-3 text-base sm:text-lg font-light tracking-wide px-4">
          Upload and summarize your documents quickly and easily
        </p>
      </div>
    </header>
  );
};

export default Header;
