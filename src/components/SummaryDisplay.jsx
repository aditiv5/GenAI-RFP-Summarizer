import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';

const SummaryDisplay = ({ summary, filename, eligibility }) => {
  const [expanded, setExpanded] = useState(false);
  const [summaryContent, setSummaryContent] = useState(null);

  useEffect(() => {
    if (summary) {
      setSummaryContent(formatSummary(summary)); // Update the summary content when summary changes
    } else {
      setSummaryContent(null); // Reset content if summary is empty
    }
  }, [summary]);

  const parseTable = (tableLines) => {
    const tableData = {
      title: '',
      headers: [],
      rows: [],
    };

    //2. Parsing the Table Data
    // Extract table title
    if (tableLines[0].startsWith('TABLE:')) {
      tableData.title = tableLines[0].replace('TABLE:', '').trim();
      tableLines.shift();
    }

    // Parse headers
    const headerLine = tableLines[0].trim();
    tableData.headers = headerLine
      .split('|')
      .map(header => header.trim())
      .filter(header => header !== '');

    // Skip header and separator lines
    const dataRows = tableLines.slice(2);

    // Parse rows
    dataRows.forEach(row => {
      if (row.includes('|')) {
        const cells = row
          .split('|')
          .map(cell => cell.trim())
          .filter(cell => cell !== '');
        if (cells.length > 0) {
          tableData.rows.push(cells);
        }
      }
    });

    return tableData;
  };

  const formatSummary = (text) => {
    // Split the input text into an array of lines based on newline characters.
    const lines = text.split('\n');
    const formattedContent = [];
    let currentTable = [];
    let isInTable = false;

    //1. Detecting Tables in Summary based on a specific prefix: TABLE:
    lines.forEach((line, index) => {
      if (line.trim().startsWith('TABLE:')) {
        isInTable = true;
        currentTable = [line];
        return;
      }

      if (isInTable) {
        // End the table when a blank line is found and parse it
        if (line.trim() === '' && currentTable.length > 2) {
          const tableData = parseTable(currentTable);
          formattedContent.push(
            <div key={`table-${index}`}>
              {renderTable(tableData)}
            </div>
          );
          currentTable = [];
          isInTable = false;
        } else if (line.trim() !== '') {
          currentTable.push(line);
          return;
        }
      }

      if (!isInTable && line.trim() !== '') {
        const romanHeadingMatch = /^(M{0,3}(CM|CD|D?C{0,3})(XC|XL|X{0,3})(IX|IV|V?I{0,3})?)\.\s/.test(line.trim());
        const enclosedRomanHeadingMatch = /^\*\*(M{0,3}(CM|CD|D?C{0,3})(XC|X{0,3})(IX|IV|V?I{0,3})?)\.\s/.test(line.trim());
        const keywordHeadingMatch = /Heading:\s/.test(line.trim());
        const colonHeadingMatch = /:\s*$/.test(line.trim());

        if (romanHeadingMatch || enclosedRomanHeadingMatch || keywordHeadingMatch || colonHeadingMatch) {
          const headingText = line.replace(/^\*\*?|\.{1}\s*|Heading:\s*|:\s*$/g, '').trim();
          formattedContent.push(
            <h3 key={index} className="font-bold text-lg text-accent-blue mt-6 mb-3">{headingText}</h3>
          );
        } else if (/^###\s/.test(line.trim())) {
          formattedContent.push(
            <h3 key={index} className="font-bold text-lg text-accent-blue mt-6 mb-3">{line.replace(/^###\s/, '')}</h3>
          );
        } else if (/^##\s/.test(line.trim())) {
          formattedContent.push(
            <h2 key={index} className="font-bold text-xl text-accent-blue mt-6 mb-3">{line.replace(/^##\s/, '')}</h2>
          );
        } 
        // If the line is not a heading, treat it as regular text.
        else {
          formattedContent.push(<p key={index} className="mt-2 text-gray-800">{line}</p>);
        }
      }
    });

    // Handle any table left after processing the lines
    if (currentTable.length > 0) {
      const tableData = parseTable(currentTable);
      formattedContent.push(
        <div key="table-final">
          {renderTable(tableData)}
        </div>
      );
    }

    return formattedContent;
  };

  //3. Rendering the Table in the UI
  const renderTable = (tableData) => {
    return (
      <div className="my-6 overflow-x-auto">
        {tableData.title && (
          <h4 className="font-bold text-lg text-accent-blue mb-3">{tableData.title}</h4>
        )}
        <table className="min-w-full border-collapse border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              {tableData.headers.map((header, index) => (
                <th key={index} className="border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-700">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableData.rows.map((row, rowIndex) => (
              <tr key={rowIndex} className="even:bg-gray-50">
                {row.map((cell, cellIndex) => (
                  <td key={cellIndex} className="border border-gray-300 px-4 py-2 text-sm text-gray-800">
                    {cell.split('<br>').map((text, i) => (
                      <React.Fragment key={i}>
                        {text}
                        {i < cell.split('<br>').length - 1 && <br />}
                      </React.Fragment>
                    ))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // const downloadPDF = () => {
  //   const doc = new jsPDF();
  //   const margin = 15;
  //   const pageWidth = doc.internal.pageSize.getWidth() - margin * 2;
  //   const headerHeight = 26;
  //   const footerHeight = 5;

  //   const logoUrl = 'https://cdn-labgd.nitrocdn.com/DgsEbCQFApREClXUXMwcDAPWJfHtBIby/assets/images/optimized/rev-2e7973c/www.cloudthat.com/wp-content/themes/masterstudy-child/newfiles/images/logo.png';
  //   const headerY = 15;
  //   doc.addImage(logoUrl, 'PNG', pageWidth - 40, headerY - 10, 30, 10);

  //   let yPosition = headerHeight + 10;
  //   const lines = summary.split('\n');
  //   let isInTable = false;
  //   let tableLines = [];

  //   lines.forEach((line) => {
  //     if (line.trim().startsWith('TABLE:')) {
  //       isInTable = true;
  //       tableLines = [line];
  //       return;
  //     }

  //     if (isInTable) {
  //       if (line.trim() === '' && tableLines.length > 2) {
  //         const tableData = parseTable(tableLines);

  //         // Set font to Times New Roman
  //         doc.setFont('Times', 'normal');
  //         doc.setFontSize(12);

  //         // Add table title
  //         doc.setFontSize(14);
  //         doc.setFont('Times', 'bold');
  //         doc.text(tableData.title, margin, yPosition);
  //         yPosition += 10;

  //         // Calculate column widths
  //         const columnCount = tableData.headers.length;
  //         const columnWidth = (pageWidth - margin) / columnCount;

  //         // Add headers
  //         doc.setFontSize(12);
  //         doc.setFont('Times', 'bold');
  //         tableData.headers.forEach((header, index) => {
  //           doc.text(header, margin + (index * columnWidth), yPosition);
  //         });
  //         yPosition += 10;

  //         // Add rows
  //         doc.setFont('Times', 'normal');
  //         tableData.rows.forEach(row => {
  //           if (yPosition > doc.internal.pageSize.height - footerHeight - margin) {
  //             doc.addPage();
  //             doc.addImage(logoUrl, 'PNG', pageWidth - 40, headerY - 10, 30, 10);
  //             yPosition = headerHeight + 10;
  //           }

  //           row.forEach((cell, index) => {
  //             const lines = doc.splitTextToSize(cell, columnWidth - 5);
  //             lines.forEach(textLine => {
  //               doc.text(textLine, margin + (index * columnWidth), yPosition);
  //               yPosition += 7; // Adjust line spacing
  //             });
  //           });
  //           yPosition += 5; // Space between rows
  //         });

  //         isInTable = false;
  //         tableLines = [];
  //       } else if (line.trim() !== '') {
  //         tableLines.push(line);
  //       }
  //     } else if (line.trim() !== '') {
  //       if (yPosition > doc.internal.pageSize.height - footerHeight - margin) {
  //         doc.addPage();
  //         doc.addImage(logoUrl, 'PNG', pageWidth - 40, headerY - 10, 30, 10);
  //         yPosition = headerHeight + 10;
  //       }

  //       const isHeading = /^(M{0,3}(CM|CD|D?C{0,3})(XC|XL|X{0,3})(IX|IV|V?I{0,3})?)\.\s/.test(line.trim()) || 
  //                        /^\*\*(M{0,3}(CM|CD|D?C{0,3})(XC|X{0,3})(IX|IV|V?I{0,3})?)\.\s/.test(line.trim()) || 
  //                        /:\s*$/.test(line.trim());

  //       doc.setFontSize(isHeading ? 14 : 12);
  //       doc.setFont('Times', isHeading ? 'bold' : 'normal');

  //       const lines = doc.splitTextToSize(line, pageWidth);
  //       lines.forEach(textLine => {
  //         doc.text(textLine, margin, yPosition);
  //         yPosition += isHeading ? 10 : 7;
  //       });
  //     }
  //   });

  //   const pageCount = doc.internal.getNumberOfPages();
  //   for (let i = 1; i <= pageCount; i++) {
  //     doc.setPage(i);
  //     doc.setFontSize(10);
  //     doc.text(`Page ${i} of ${pageCount}`, margin, doc.internal.pageSize.height - footerHeight + 3);
  //   }

  //   const pdfFileName = filename.includes('.') 
  //     ? `${filename.split('.').slice(0, -1).join('.')} Summary.pdf`
  //     : `${filename} Summary.pdf`;

  //   doc.save(pdfFileName);
  // };

  return (
    <div className="mt-12 p-8 bg-gradient-to-r from-dark-navy to-navy rounded-lg shadow-lg max-w-4xl mx-auto text-gray-light transition-all duration-300 text-left">
      <h2 className="text-3xl font-semibold text-accent-blue mb-6 drop-shadow-lg text-center">Summary</h2>
      {summaryContent ? (
        <div>
          <div className={`${expanded ? '' : 'max-h-96 overflow-hidden'}`}>
            {summaryContent}
          </div>
          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setExpanded(!expanded)}
              className={`text-accent-blue hover:underline focus:outline-none transition-all duration-300 transform hover:scale-105 ${expanded ? 'bg-blue-200' : 'bg-blue-100'} p-2 rounded`}
              aria-expanded={expanded}
              aria-controls="summary-content"
            >
              {expanded ? 'Show Less' : 'Show More'}
            </button>
            {/* <button
              onClick={downloadPDF}
              className="bg-gradient-to-r from-[#22639c] to-[#009ca7] text-white px-6 py-3 rounded mb-4 sm:mb-0 sm:mr-4 hover:from-[#009ca7] hover:to-light-navy transition-all duration-200 shadow-lg"
            >
              Download PDF
            </button> */}
          </div>
        </div>
      ) : (
        <p className="text-black italic">Click on the Generate Summary button to see the summary.</p>
      )}
      {eligibility && eligibility.trim() !== '' && (
        <div className="mt-8">
          <h3 className="text-2xl font-semibold text-accent-blue mb-4">Eligibility Information</h3>
          <p className="text-black">{eligibility}</p>
        </div>
      )}
    </div>
  );
};

export default SummaryDisplay;
