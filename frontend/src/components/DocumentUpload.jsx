import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Upload, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const DocumentUpload = ({ dealId, onUploadSuccess }) => {
    const { api, user } = useAuth();
    const [file, setFile] = useState(null);
    const [docType, setDocType] = useState('PITCH_DECK');
    const [isPrivate, setIsPrivate] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
            setError(null);
            setSuccess(false);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            setError("Please select a file");
            return;
        }

        setUploading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);
        formData.append('dealId', dealId);
        formData.append('type', docType);
        formData.append('isPrivate', isPrivate);
        formData.append('userId', user.id);

        try {
            await api.post('/documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setSuccess(true);
            setFile(null);
            if (onUploadSuccess) onUploadSuccess();
        } catch (err) {
            console.error(err);
            setError(err.response?.data || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <Upload className="w-5 h-5" /> Upload Document
            </h3>

            <div className="space-y-4">
                {/* File Input */}
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
                    <input
                        type="file"
                        id="file-upload"
                        className="hidden"
                        onChange={handleFileChange}
                        accept=".pdf"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
                        {file ? (
                            <>
                                <FileText className="w-8 h-8 text-emerald-600" />
                                <span className="text-sm font-medium text-slate-700">{file.name}</span>
                                <span className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                            </>
                        ) : (
                            <>
                                <Upload className="w-8 h-8 text-slate-400" />
                                <span className="text-sm text-slate-600">Click to select PDF</span>
                            </>
                        )}
                    </label>
                    {file && (
                        <button
                            onClick={(e) => { e.preventDefault(); setFile(null); }}
                            className="mt-2 text-xs text-red-500 hover:text-red-700"
                        >
                            Remove
                        </button>
                    )}
                </div>

                {/* Type Selection */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Document Type</label>
                        <select
                            value={docType}
                            onChange={(e) => setDocType(e.target.value)}
                            className="w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                        >
                            <option value="PITCH_DECK">Pitch Deck</option>
                            <option value="FINANCIALS">Financials</option>
                            <option value="LEGAL">Legal</option>
                            <option value="OTHER">Other</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Visibility</label>
                        <select
                            value={isPrivate}
                            onChange={(e) => setIsPrivate(e.target.value === 'true')}
                            className="w-full rounded-md border-slate-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm"
                        >
                            <option value="true">Private</option>
                            <option value="false">Public</option>
                        </select>
                    </div>
                </div>

                {/* Status Messages */}
                {error && (
                    <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-md">
                        <AlertCircle className="w-4 h-4" />
                        {error}
                    </div>
                )}
                {success && (
                    <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 p-3 rounded-md">
                        <CheckCircle className="w-4 h-4" />
                        Upload successful!
                    </div>
                )}

                {/* Upload Button */}
                <button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
                        ${!file || uploading ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500'}`}
                >
                    {uploading ? 'Uploading...' : 'Upload Document'}
                </button>
            </div>
        </div>
    );
};

export default DocumentUpload;
