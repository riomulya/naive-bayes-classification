import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';

function FileInput() {
    const [excelData, setExcelData] = useState<any[][]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [classificationResult, setClassificationResult] = useState<string | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<{ [key: number]: string }>({});


    useEffect(() => {
        handleClassify();
    }, [selectedOptions]);

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

        // Remove irrelevant columns like job_id and fraudulent
        const startColumnIndex = 1; // Skip the first column
        const endColumnIndex = parsedData[0].length - 2; // Skip the last column
        const filteredData = parsedData.map(row => row.slice(startColumnIndex, endColumnIndex + 1));

        setExcelData(filteredData);
    };

    const readExcelFile = async (file: File): Promise<XLSX.WorkBook | null> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => {
                const data = new Uint8Array(reader.result as ArrayBuffer);
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

    const naiveBayesClassification = (features: any[][], labels: any[], inputFeatures: any[]) => {
        console.log('features:', features);
        console.log('labels:', labels);
        console.log('inputFeatures:', inputFeatures);

        const uniqueLabels = [...new Set(labels)];
        const totalData = labels.length;
        let classCount: number;

        // Calculate prior probabilities
        const priorProbabilities = uniqueLabels.map(cls => {
            classCount = labels.filter(label => label === cls).length; // Calculate classCount here
            console.log('Prior probability:', cls, classCount / totalData);
            return classCount / totalData;
        });

        // Calculate likelihoods with Laplace smoothing
        const likelihoods: number[][] = [];
        for (let i = 0; i < inputFeatures.length; i++) {
            const featureLikelihoods: number[] = [];
            for (let cls of uniqueLabels) {
                classCount = labels.filter(label => label === cls).length; // Update classCount for each class
                const featureCount = features.filter((row, idx) => row[i] === inputFeatures[i] && labels[idx] === cls).length;
                const likelihood = (featureCount + 1) / (classCount + 2); // Laplace smoothing
                console.log('Likelihood:', cls, inputFeatures[i], likelihood);
                featureLikelihoods.push(likelihood);
            }
            likelihoods.push(featureLikelihoods);
        }

        // Calculate posterior probabilities
        const posteriorProbabilities = uniqueLabels.map((cls, clsIndex) => {
            let posterior = priorProbabilities[clsIndex];
            for (let i = 0; i < inputFeatures.length; i++) {
                const featureIndex = getUniqueValues(i).indexOf(inputFeatures[i]);
                if (featureIndex !== -1) {
                    posterior *= likelihoods[i][clsIndex];
                } else {
                    posterior *= 1 / (classCount + 2); // Smoothing for unseen values, use updated classCount
                }
            }
            console.log('Posterior probability:', cls, posterior);
            return posterior;
        });

        // Determine the predicted class
        const maxProbability = Math.max(...posteriorProbabilities);
        const predictedClass = uniqueLabels[posteriorProbabilities.indexOf(maxProbability)];
        const correctedMaxProbability = typeof maxProbability === 'number' && !isNaN(maxProbability) ? maxProbability : 1 / (labels.length + 2);
        console.log('Predicted class:', predictedClass, 'Max probability:', correctedMaxProbability);
        return [predictedClass, (correctedMaxProbability * 100000).toFixed(20)];
    };

    const handleClassify = () => {
        if (Object.keys(selectedOptions).length === 0) return;

        const features = excelData.map(row => Object.values(row).slice(0, -1));
        const labels = excelData.map(row => row[row.length - 1]);

        const inputFeatures = Object.values(selectedOptions);

        const [predictedClass, maxProbability] = naiveBayesClassification(features, labels, inputFeatures);

        setClassificationResult(`Predicted class:  "Fraudulent" , Probability: ${maxProbability}%`);
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
                        <select
                            className="w-full border border-gray-200 rounded-lg py-2 px-4 outline-none focus:border-blue-500 focus:ring-blue-500"
                            onChange={(e) => {
                                const newValue = e.target.value;
                                setSelectedOptions(prevState => ({
                                    ...prevState,
                                    [index]: newValue
                                }));
                            }}
                            name={`${index}`}
                        >
                            <option value="">Select...</option>
                            {getUniqueValues(index).map((value, idx) => (
                                <option key={idx} value={value}>{value}</option>
                            ))}
                        </select>
                    </div>
                ))}
            </div>

            <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg"
                onClick={handleClassify}
            >
                Classify
            </button>

            {classificationResult && (
                <div className="my-10">
                    <p>{classificationResult}</p>
                </div>
            )}
        </div>
    );
}

export default FileInput;
