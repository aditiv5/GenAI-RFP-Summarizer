import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header';
import DocumentList from './components/DocumentList';
import SummaryDisplay from './components/SummaryDisplay';
import Modal from './components/Modal';
import axios from 'axios';
import UserContext from './Context/UserContext';
import { Auth } from 'aws-amplify';
import QAComponent from './components/QAComponent';  // Import the QAComponent

export const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQAComponentOpen, setIsQAComponentOpen] = useState(false);  // State to control QA component visibility
  const [isDelayApplied, setIsDelayApplied] = useState(false);
  const [userEmail, setUserEmail] = useState('');  // State to store user's email

  const navigate = useNavigate();
  const { userDetails, setUserState, userState } = useContext(UserContext);

  const selectedDocument = documents.find((doc) => doc.id === selectedDocumentId);

  // Effect to clear user details on component mount (i.e., when the page loads)
  useEffect(() => {
    setUserState({
      ...userState,
      userDetails: null,
    });
  }, []);

  // Fetch user email using AWS Cognito GetUser API (falls back to context if not available)
  // const fetchUserEmail = async () => {
  //   try {
  //     const user = await Auth.currentUserInfo();
  //     const email = user?.attributes?.email || userDetails?.attributes?.email;
  //     if (email) {
  //       setUserEmail(email);
  //     }
  //   } catch (error) {
  //     console.error('Error fetching user email:', error);
  //   }
  // };

  const fetchUserEmail = async () => {
    try {
      const user = await Auth.currentUserInfo();
      if (!user) {
        // If no user found, redirect to login page
        navigate('/login');
        return;
      }
      const email = user?.attributes?.email || userDetails?.attributes?.email;
      if (email) {
        setUserEmail(email);
      }
    } catch (error) {
      console.error('Error fetching user email:', error);
      if (error.code === 'NotAuthorizedException' || error.code === 'ExpiredToken') {
        // If session has expired, reauthenticate the user
        await reauthenticateUser();
      }
    }
  };
  
  const reauthenticateUser = async () => {
    try {
      // Optionally call Auth.signIn() or navigate to login screen
      await Auth.signOut();  // Sign out current session
      navigate('/login');    // Navigate user to login page to authenticate
    } catch (error) {
      console.error('Error during re-authentication:', error);
    }
  };
  

  // Reset summary when selectedDocumentId changes
  useEffect(() => {
    setSummary(''); // Clear summary whenever a new document is selected
  }, [selectedDocumentId]);

  // Handle logout functionality
  const handleLogout = async () => {
    try {
      await Auth.signOut();
      setUserState({
        ...userState,
        userDetails: null,
      });
      navigate('/login');
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  // Function to fetch previously uploaded documents of the logged-in user
  const fetchUserDocuments = async (email) => {
    try {
      console.log("Fetching documents for email:", email); // Log the email to ensure it's correct.
      
      //const response = await axios.get(https://e5aq51m6hc.execute-api.ap-south-1.amazonaws.com/dev/documents?email=${email});
      const response = await axios.get(`https://qjmo6fdbn1.execute-api.ap-south-1.amazonaws.com/dev/documents?email=${email}`);
      console.log("API Response:", response); // Log the entire API response.
  
      // Parse the response body if it's a string
      const responseBody = typeof response.data.body === 'string' ? JSON.parse(response.data.body) : response.data.body;
  
      console.log("Parsed Response Body:", responseBody); // Log parsed response body
  
      // Check if document_urls is available in the response
      if (responseBody && responseBody.document_urls && Array.isArray(responseBody.document_urls)) {
        console.log("Fetched document URLs:", responseBody.document_urls); // Log the document URLs array.
  
        // Process the document URLs into the expected document format
        const documents = responseBody.document_urls.map((docUrl) => {
          // Extract file name and type from the URL
          const urlParts = docUrl.split('/');
          const fileNameWithParams = urlParts[urlParts.length - 1];
          const [fileNameWithExtension] = fileNameWithParams.split('?');
          
          // Extract file name from the URL
          const firstUnderscoreIndex = fileNameWithExtension.indexOf('_');
          const firstDotIndex = fileNameWithExtension.indexOf('.');

          let fileName = fileNameWithExtension.substring(firstUnderscoreIndex + 1, firstDotIndex).trim();
          fileName = fileName.replace(/%/g, ' ');  // Replace any encoded spaces with actual spaces

          // Extract file type (pdf, doc, image, etc.)
          const extension = fileNameWithExtension.split('.').pop().toLowerCase();
          const docType = ['pdf'].includes(extension) ? 'pdf' :
                          ['doc', 'docx'].includes(extension) ? 'docx' :
                          ['jpg', 'jpeg', 'png', 'gif'].includes(extension) ? 'image' : 'unknown';

          // Return the formatted document object
          return {
            id: Math.random().toString(36).substr(2, 9), // Generate a random ID for now
            name: fileName,
            url: docUrl,
            type: docType,
            unique_id: '', // Assuming unique_id is not provided for these previously uploaded documents
          };
        });
  
        // Set the documents to the state
        setDocuments(documents);
      } else {
        console.error('No document URLs found or incorrect response format:', responseBody);
      }
    } catch (error) {
      console.error('Error fetching user documents:', error);
    }
  };

  // UseEffect to fetch documents when user logs in
  useEffect(() => {
    fetchUserEmail();  // Fetch user email on component load
  }, []);

  // UseEffect to fetch documents once email is retrieved
  useEffect(() => {
    if (userEmail) {
      fetchUserDocuments(userEmail);  // Fetch documents after email is available
    } else {
      setDocuments([]);  // Clear documents if no email is retrieved
    }
  }, [userEmail]);

  // Function to generate a pre-signed URL for file upload (Only responsible for generating the pre-signed URL now)
  const generatePreSignedURL = async (file) => {
    try {
      console.log('Starting pre-signed URL generation for file:', file);
      //const apiUrl = 'https://e5aq51m6hc.execute-api.ap-south-1.amazonaws.com/dev/upload';
      const apiUrl = 'https://qjmo6fdbn1.execute-api.ap-south-1.amazonaws.com/dev/upload';
      const response = await axios.post(apiUrl, {
        file_name: file.name,
        user_email: userEmail,
      });

      const responseBody = JSON.parse(response.data.body);
      const { presigned_url, unique_key } = responseBody;

      return { presignedUrl: presigned_url, uniqueKey: unique_key };
    } catch (error) {
      console.error('Error getting pre-signed URL:', error);
      throw new Error('Failed to get pre-signed URL');
    }
  };

  // Function to handle file upload
  const handleFileUpload = async (file) => {
    try {
      const { presignedUrl, uniqueKey } = await generatePreSignedURL(file);
      await axios.put(presignedUrl, file, { headers: { 'Content-Type': file.type } });

      const extension = file.name.split('.').pop().toLowerCase();
      const docType = ['pdf'].includes(extension) ? 'pdf' :
                      ['doc', 'docx'].includes(extension) ? 'docx' :
                      ['jpg', 'jpeg', 'png', 'gif'].includes(extension) ? 'image' : 'unknown';

      const newDocument = {
        id: uniqueKey.split('/')[2].split('_')[0] || Math.random().toString(36).substr(2, 9),
        name: file.name,
        url: presignedUrl.split('?')[0],
        type: docType,
        unique_id: uniqueKey.split('/')[2].split('_')[0],
        isNewlyUploaded: true,
      };

      setDocuments((prevDocuments) => [...prevDocuments, newDocument]);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  // Function to generate summary for the selected document
  const handleGenerateSummary = async () => {
    if (!selectedDocument) return;

    setLoading(true);

    try {
      let uniqueId, fileName;

      // Log the selected document URL
      console.log('Selected Document URL:', selectedDocument.url);

      if (selectedDocument.unique_id) {
        uniqueId = selectedDocument.unique_id;
        console.log('Dashboard Unique ID:', uniqueId);
        const fileNameWithoutExtension = selectedDocument.name.split('.').slice(0, -1).join('.');
        fileName = encodeURIComponent(fileNameWithoutExtension);
      } else {
        const urlParts = selectedDocument.url.split('/');
        if (urlParts.length > 5) {
          uniqueId = urlParts[5].split('_')[0];
          const fileNameWithParams = urlParts[urlParts.length - 1];
          const [fileNameWithExtension] = fileNameWithParams.split('?');
          const firstUnderscoreIndex = fileNameWithExtension.indexOf('_');
          const firstDotIndex = fileNameWithExtension.indexOf('.');

          if (firstUnderscoreIndex !== -1 && firstDotIndex !== -1) {
            fileName = fileNameWithExtension.substring(firstUnderscoreIndex + 1, firstDotIndex).trim();
            fileName = fileName.replace(/ /g, '%20').replace(/\(/g, '%28').replace(/\)/g, '%29');
          } else {
            console.error('File name extraction failed.');
          }
        } else {
          console.error('URL does not contain enough parts to extract unique_id.');
        }
      }

      if (uniqueId && fileName) {
        //const apiUrl = https://e5aq51m6hc.execute-api.ap-south-1.amazonaws.com/dev/summarize?unique_id=${uniqueId}&file_name=${fileName};
        const apiUrl = `https://qjmo6fdbn1.execute-api.ap-south-1.amazonaws.com/dev/summarize?unique_id=${uniqueId}&file_name=${fileName}`;

        let summaryResponse;

        // Apply a 1-minute delay for newly uploaded documents if not already applied
        if (selectedDocument.isNewlyUploaded && !isDelayApplied) {
          setIsDelayApplied(true);  // Mark that the delay has been applied
          console.log('Newly uploaded document detected. Waiting for 1 minute...');
          await new Promise(resolve => setTimeout(resolve, 60000));  // 1-minute delay
        }

        // Fetch the summary for both newly uploaded and previously uploaded documents
        while (true) {
          summaryResponse = await axios.get(apiUrl);

          if (summaryResponse.data && summaryResponse.data.body) {
            const responseBody = JSON.parse(summaryResponse.data.body);
            if (responseBody.summary) {
              setSummary(responseBody.summary);
              break;
            } else {
              console.warn('Summary not found, will retry...');
              await new Promise((resolve) => setTimeout(resolve, 8000));  // Retry every 8 seconds
            }
          } else {
            setSummary('Unexpected response format.');
            break;
          }
        }
      } else {
        console.error('Failed to extract unique_id or file_name, cannot fetch summary.');
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
      setSummary('Failed to fetch summary.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="flex justify-between p-4">
        <h1 className="text-xl text-white">Document Summary App</h1>
        <div className="flex flex-col items-end">
          {/* <button
            className={userDetails ? 'bg-red-700 hover:bg-red-800' : 'bg-[#22639c] hover:bg-blue-700'}
            onClick={() => {
              if (userDetails) {
                handleLogout();
              } else {
                navigate('/login');
              }
            }}
          >
            {userDetails ? 'Logout' : 'Login'}
          </button> */}
          {window.location.hostname === 'localhost' && (
            <>
          <button
            className={`${
              userDetails ? 'bg-red-700 hover:bg-red-800' : 'bg-[#22639c] hover:bg-blue-700'
            } text-white px-6 py-2 rounded transition-all duration-200`}
            onClick={() => {
              if (userDetails) {
                handleLogout();
              } else {
                navigate('/login');
              }
            }}
          >
            {userDetails ? 'Logout' : 'Login'}
          </button>
          {userDetails && userDetails.attributes && (
            <p className="text-black text-center mt-2">
              You are logged in as <strong>{userDetails.attributes.email}</strong>
            </p>
          )}
          </>
          )}
        </div>
      </div>
      <div className="flex-grow flex flex-col lg:flex-row">
        <DocumentList
          documents={documents}
          onUpload={handleFileUpload}
          selectedDocumentId={selectedDocumentId}
          setSelectedDocumentId={setSelectedDocumentId}
          isLoggedIn={!!userDetails}  
        />
        <div className="flex-grow p-8 bg-navy text-gray-light">
          {selectedDocument ? (
            <div className="text-center">
              <h2 className="text-2xl mb-6 text-black">{selectedDocument.name}</h2>
              <div className="flex flex-col sm:flex-row justify-center mb-8">
                <button
                  className="bg-[#22639c] text-white px-6 py-3 rounded mb-4 sm:mb-0 sm:mr-4 hover:bg-[#009ca7] transition-all duration-200"
                  onClick={() => setIsModalOpen(true)}
                >
                  Preview
                </button>
                <button
                  className="bg-[#22639c] text-white px-6 py-3 rounded mb-4 sm:mb-0 sm:mr-4 hover:bg-[#009ca7] transition-all duration-200"
                  onClick={handleGenerateSummary}
                >
                  Generate Summary
                </button>
                {/* Button to open QA Component */}
                <button
                  className="bg-[#22639c] text-white px-6 py-3 rounded mb-4 sm:mb-0 sm:mr-4 hover:bg-[#009ca7] transition-all duration-200"
                  onClick={() => setIsQAComponentOpen(true)}  // Open the QA Component
                >
                  QA with Document
                </button>
              </div>
              <div className="mt-8">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-accent-blue mx-auto"></div>
                    {isDelayApplied && (
                      <p className="mt-4 text-center text-gray-light">
                        Generating summary in a minute...
                      </p>
                    )}
                  </>
                ) : (
                  <SummaryDisplay summary={summary} filename={selectedDocument.name} />
                )}
              </div>
            </div>
          ) : (
            <p className="text-black">Select a document to preview and summarize.</p>
          )}
        </div>
      </div>

      {/* QA Component */}
      {isQAComponentOpen && selectedDocument && (
        <QAComponent
          key={selectedDocumentId} // Ensure QA component remounts on document change
          document={selectedDocument}
          onClose={() => setIsQAComponentOpen(false)}  // Close the QA component
        />
      )}

      {isModalOpen && selectedDocument?.url && selectedDocument?.type !== 'unknown' && (
        <Modal
          documentUrl={selectedDocument.url}
          documentType={selectedDocument.type}
          onClose={() => setIsModalOpen(false)}
          documentName={selectedDocument.name}
        />
      )}
      {selectedDocument?.type === 'unknown' && (
        <p className="text-red-600 text-center mt-4">This file type is not supported for preview.</p>
      )}
    </>
  );
};
