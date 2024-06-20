import React, { useState } from 'react';
import * as XLSX from 'xlsx';

interface FileUploaderProps {
    onDataLoaded: (data: any[][]) => void;
}

const FileUploader: React.FC<FileUploaderProps> = ({ onDataLoaded }) => {
    const [file, setFile] = useState<File | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files[0]) {
            const file = files[0];
            setFile(file);

            const reader = new FileReader();
            reader.onload = (event) => {
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
                onDataLoaded(worksheet as any[][]);
            };
            reader.readAsArrayBuffer(file);
        }
    };

    return (
        <>
            <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
        </>
    );
};

export default FileUploader;
