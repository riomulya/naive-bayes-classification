import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons/faSpinner";

function FileInput() {
    const [excelData, setExcelData] = useState<any[][]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Function to perform Naive Bayes classification
    const naiveBayesClassification = (excelData: any[][], selectedFeatures: number[]): number[] => {
        // TODO: Implement Naive Bayes classification algorithm here
        // 1. Hitung probabilitas prior (probabilitas masing-masing kelas)
        // 2. Hitung probabilitas likelihood (probabilitas masing-masing fitur berdasarkan kelas)
        // 3. Hitung probabilitas posterior (probabilitas kelas berdasarkan masing-masing fitur)
        // 4. Lakukan klasifikasi berdasarkan probabilitas posterior terbesar

        // Dummy implementation: return dummy classification result (0 for fake, 1 for genuine)
        const classifications: number[] = Array.from({ length: excelData.length }, () => Math.round(Math.random()));
        return classifications;
    };



    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsLoading(true);
        const file = e.target.files?.[0];
        if (!file) {
            setIsLoading(false);
            return;
        }

        const workbook = await readExcelFile(file);
        setIsLoading(false);
        if (!workbook) return;

        const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
        const worksheet = workbook.Sheets[sheetName];
        const parsedData: any[] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        const startColumnIndex = 1;
        const endColumnIndex = parsedData[0].length - 2;
        const filteredData = parsedData.map(row => row.slice(startColumnIndex, endColumnIndex + 1));

        setExcelData(filteredData);
    };

    const readExcelFile = async (file: File): Promise<XLSX.WorkBook | null> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                const target = reader.result;
                if (!(target instanceof ArrayBuffer)) {
                    resolve(null);
                    return;
                }
                const data = new Uint8Array(target);
                const workbook = XLSX.read(data, { type: 'array' });
                resolve(workbook);
            };
            reader.readAsArrayBuffer(file);
        });
    };

    const getUniqueValues = (columnIndex: number): string[] => {
        const values = excelData.map((row) => row[columnIndex]);
        return [...new Set(values)];
    };

    return (
        <div className="text-center">
            <form className="max-w-sm mx-auto mt-10">
                <label htmlFor="file-input" className="sr-only">Choose file</label>
                <input
                    type="file"
                    name="file-input"
                    id="file-input"
                    className="block w-full border border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400
                    file:bg-gray-50 file:border-0
                    file:me-4
                    file:py-3 file:px-4
                    dark:file:bg-neutral-700 dark:file:text-neutral-400"
                    onChange={handleFileUpload}
                />
            </form>

            {isLoading && (
                <div className="flex justify-center items-center mt-8">
                    <FontAwesomeIcon icon={faSpinner} className="animate-spin text-blue-500 mr-2" />
                    <span>Loading...</span>
                </div>
            )}

            <div className="grid grid-cols-1 gap-4 w-1/4 mx-auto mt-10">
                {excelData.length > 0 && excelData[0].map((columnHeader, index) => (
                    <div key={index}>
                        <h3 className="text-lg font-semibold mb-2">{columnHeader}</h3>
                        <select className="w-full border border-gray-200 rounded-lg py-2 px-4 outline-none focus:border-blue-500 focus:ring-blue-500">
                            {getUniqueValues(index).map((value, index) => (
                                <option key={index} value={value}>{value}</option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FileInput;
