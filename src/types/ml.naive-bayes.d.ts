declare module 'ml-naivebayes' {
    interface TrainingData {
        features: any[];
        label: any;
    }

    class NaiveBayes {
        constructor();
        train(trainingSet: TrainingData[]): void;
        predict(features: any[]): any;
    }

    export { NaiveBayes, TrainingData };
}
