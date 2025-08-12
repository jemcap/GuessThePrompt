interface AIOutputDisplayProps {
  aiOutput: string;
  outputType: "text" | "code";
}

const AIOutputDisplay = ({ aiOutput, outputType }: AIOutputDisplayProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Reverse Engineer This:
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          What prompt created the output below?
        </p>
      </div>
      
      <div className="p-4">
        <div
          className={`p-4 rounded-lg ${
            outputType === "code"
              ? "bg-gray-900 text-gray-100 font-mono text-sm"
              : "bg-gray-50 text-gray-900"
          }`}
        >
          <pre className="whitespace-pre-wrap break-words">
            {aiOutput}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default AIOutputDisplay;