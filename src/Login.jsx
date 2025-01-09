import { Auth } from 'aws-amplify';
import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Main() {
  const navigate = useNavigate();

  const loginWithCloudThat = async () => {
    try {
      const user = await Auth.federatedSignIn({
        customProvider: 'demos-cloudthat',
      });
      if (user) {
        //let nextPage = window.localStorage.getItem('currentPage') || 'dashboard';
        //navigate('/' + nextPage);
      }
    } catch (error) {
      console.log('error signing in', error);
    }
  };

  return (
    <div className="flex h-screen font-sans">
      <div className="relative flex flex-col justify-center items-center w-1/2 bg-[#22639c] text-white text-center">
        <img
          //src="https://datasymphony.movetoaws.com/assets/white-logo.f6b1dea8.png"
          src="dashboard/images/CT_logo_horizontal.svg"
          alt="cloudthat logo"
          className="absolute top-8 left-8 w-25 h-12"
        />
        <img
          //src="https://datasymphony.movetoaws.com/assets/illustration.bbfd1da0.svg"
          src="/genai/assets/illustration.svg"
          alt="illustration"
          className="w-58 mb-8"
        />
        <h1 className="text-2xl mb-4">A few more clicks to sign in to your account.</h1>
        <p className="text-gray-300 text-base">Manage all your data in one place</p>
      </div>
      <div className="flex flex-col justify-center items-center w-3/5 bg-gray-100 h-full">
        <h1 className="absolute top-8 text-4xl mb-2 font-bold text-[#22639c] tracking-wide">
          RFP/EOI Summarizer
        </h1>
        <p className="absolute top-24 text-lg text-gray-700 font-semibold mb-4" style={{ color: '#22639c' }}>
          Upload and summarize your documents quickly and easily
        </p>
        <button
          className="bg-[#22639c] text-white py-4 px-10 mt-4 rounded-lg text-lg hover:bg-blue-800 transition-colors duration-300 shadow-lg"
          onClick={loginWithCloudThat}
        >
          Login with CloudThat
        </button>
      </div>
    </div>
  );
}

export default Main;
