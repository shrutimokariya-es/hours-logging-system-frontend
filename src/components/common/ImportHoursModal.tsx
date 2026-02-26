import React, { useState, useRef } from 'react';
import { X, Upload, AlertCircle, CheckCircle, Download } from 'lucide-react';
import hourLogService from '../../services/hourLogService';
import { downloadCSVTemplate } from '../../utils/csvGenerator';

interface ImportHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: () => void;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

const ImportHoursModal: React.FC<ImportHoursModalProps> = ({ isOpen, onClose, onImportSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setResult(null);
    } else {
      setFile(null);
      alert('Please select a valid CSV file');
    }
  };

  const parseCSV = (text: string): any[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const records: any[] = [];
    
    // Find the header row - look for "Client Name" or "Client" column
    let headerIndex = -1;
    let isTemplateFormat = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].toLowerCase();
      if (line.includes('client name') || line.includes('client')) {
        headerIndex = i;
        isTemplateFormat = line.includes('client name');
        break;
      }
    }
    
    if (headerIndex === -1) {
      throw new Error('Invalid CSV format: Header row not found. Please use the template format.');
    }
    
    // Parse data rows starting after header
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Skip empty lines, example rows, or section headers
      if (!line || line.toLowerCase().includes('example') || line.startsWith('"Top Clients"')) {
        continue;
      }
      
      // Parse CSV line (handle quoted values)
      const values = line.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g) || [];
      const cleanValues = values.map(v => v.replace(/^"|"$/g, '').trim());
      
      if (cleanValues.length >= 5) {
        // Template format: Client Name, Developer Name, Project, Date, Hours, Description
        if (isTemplateFormat) {
          records.push({
            clientName: cleanValues[0],
            developerName: cleanValues[1],
            project: cleanValues[2],
            date: cleanValues[3],
            hours: parseFloat(cleanValues[4]),
            description: cleanValues[5] || ''
          });
        } else {
          // Report format: Project, Client, Developer, Hours, Date, Description
          records.push({
            project: cleanValues[0],
            clientName: cleanValues[1],
            developerName: cleanValues[2],
            hours: parseFloat(cleanValues[3]),
            date: cleanValues[4],
            description: cleanValues[5] || ''
          });
        }
      }
    }
    
    return records;
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    setResult(null);

    try {
      const text = await file.text();
      const records = parseCSV(text);
      
      if (records.length === 0) {
        throw new Error('No valid records found in CSV file');
      }

      // Import records one by one
      let success = 0;
      let failed = 0;
      const errors: string[] = [];

      for (const record of records) {
        try {
          // You'll need to implement this endpoint in your backend
          await hourLogService.importHourLog(record);
          success++;
        } catch (error: any) {
          console.log("error", error);
          failed++;
          const errorMsg = error.response?.data?.message || error.message || 'Import failed';
          errors.push(`Row ${success + failed}: ${errorMsg}`);
        }
      }

      setResult({ success, failed, errors: errors.slice(0, 10) }); // Show first 10 errors
      
      if (success > 0) {
        onImportSuccess();
      }
    } catch (error: any) {
      setResult({
        success: 0,
        failed: 0,
        errors: [error.message || 'Failed to parse CSV file']
      });
    } finally {
      setImporting(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={handleClose}
        ></div>

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                  <Upload className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="ml-3 text-lg leading-6 font-medium text-gray-900">
                  Import Hours from CSV
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={24} />
              </button>
            </div>

            <div className="mt-4">
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <p className="text-sm text-blue-800 mb-2">
                  <AlertCircle size={14} className="inline mr-1" />
                  <strong>How to use:</strong>
                </p>
                <ol className="text-xs text-blue-700 space-y-1 ml-4 list-decimal">
                  <li>Download the CSV template below</li>
                  <li>Fill in hour log data for multiple developers/projects</li>
                  <li>Save the file and upload it here</li>
                  <li>System will import all rows automatically</li>
                </ol>
                <div className="mt-3 p-2 bg-white rounded border border-blue-200">
                  <p className="text-xs font-mono text-gray-700">
                    <strong>CSV Format:</strong><br/>
                    Client Name, Developer Name, Project, Date, Hours, Description<br/>
                    Acme Corp, John Doe, Website Redesign, 2024-01-15, 8, Frontend work<br/>
                    Acme Corp, Jane Smith, API Development, 2024-01-15, 6, Backend API
                  </p>
                </div>
              </div>

              {/* Download Template Button */}
              <div className="mb-4">
                <button
                  onClick={() => downloadCSVTemplate()}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <Download size={18} />
                  <span>Download CSV Template</span>
                </button>
              </div>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>

              <p className="text-sm text-gray-500 mb-4">
                Upload a CSV file (template format or exported report) to import hour logs.
              </p>

              {/* File input */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select CSV File
                </label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="block w-full text-sm text-gray-500
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    cursor-pointer"
                />
              </div>

              {file && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800">
                    <CheckCircle size={16} className="inline mr-2" />
                    Selected: {file.name}
                  </p>
                </div>
              )}

              {/* Import result */}
              {result && (
                <div className={`mb-4 p-4 rounded-md ${
                  result.success > 0 ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                }`}>
                  <p className="text-sm font-medium mb-2">
                    Import Results:
                  </p>
                  <ul className="text-sm space-y-1">
                    <li className="text-green-700">✓ Successfully imported: {result.success}</li>
                    {result.failed > 0 && (
                      <li className="text-red-700">✗ Failed: {result.failed}</li>
                    )}
                  </ul>
                  
                  {result.errors.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-red-700 mb-1">Errors:</p>
                      <ul className="text-xs text-red-600 space-y-1 max-h-32 overflow-y-auto">
                        {result.errors.map((error, index) => (
                          <li key={index}>• {error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Instructions */}
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-xs text-yellow-800">
                  <AlertCircle size={14} className="inline mr-1" />
                  <strong>Important:</strong> Client and Developer names must exactly match existing users in the system. Projects will be created automatically if they don't exist.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              onClick={handleImport}
              disabled={!file || importing}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Importing...
                </>
              ) : (
                'Import'
              )}
            </button>
            <button
              type="button"
              onClick={handleClose}
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImportHoursModal;
