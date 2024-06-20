import React, { useState } from 'react';

interface NaiveBayesClassifierProps {
    data: any[][];
}

interface TrainingData {
    features: any[];
    label: any;
}

const NaiveBayesClassifier: React.FC<NaiveBayesClassifierProps> = ({ data }) => {
    const [features, setFeatures] = useState<string[]>([]);
    const [label, setLabel] = useState<string>('');
    const [result, setResult] = useState<any[] | null>(null);

    const handleFeatureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const options = e.target.options;
        const selectedFeatures: string[] = [];
        for (const option of options) {
            if (option.selected) {
                selectedFeatures.push(option.value);
            }
        }
        setFeatures(selectedFeatures);
    };

    const handleLabelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLabel(e.target.value);
    };

    const handleClassify = async () => {
        const { NaiveBayes } = await import('ml-naivebayes');
        const featureIndices = features.map(feature => data[0].indexOf(feature));
        const labelIndex = data[0].indexOf(label);

        const trainingData: TrainingData[] = data.slice(1).map(row => {
            const features = featureIndices.map(index => row[index]);
            const label = row[labelIndex];
            return { features, label };
        });

        const classifier = new NaiveBayes();
        classifier.train(trainingData);

        const testData = trainingData.map(item => item.features);
        const predictions = testData.map(features => classifier.predict(features));

        setResult(predictions);
    };

    return (
        <div>
            <div>
                <label>Select Features:</label>
                <select multiple onChange={handleFeatureChange}>
                    {data[0].map((col: string, index: number) => (
                        <option key={index} value={col}>{col}</option>
                    ))}
                </select>
            </div>
            <div>
                <label>Select Label:</label>
                <select onChange={handleLabelChange}>
                    {data[0].map((col: string, index: number) => (
                        <option key={index} value={col}>{col}</option>
                    ))}
                </select>
            </div>
            <button onClick={handleClassify}>Classify</button>
            {result && (
                <div>
                    <h3>Classification Results:</h3>
                    <ul>
                        {result.map((res, index) => (
                            <li key={index}>{res}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default NaiveBayesClassifier;
