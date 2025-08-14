interface AIOutputDisplayProps {
  aiOutput: string;
  outputType: "text" | "code" | "image";
}

const AIOutputDisplay = ({ aiOutput, outputType }: AIOutputDisplayProps) => {
  return (
    <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700">
      <div className="p-4 border-b border-gray-600">
        <h2 className="text-lg font-semibold text-white">
          Reverse Engineer This:
        </h2>
        <p className="text-sm text-gray-300 mt-1">
          What prompt created the output below?
        </p>
      </div>
      
      <div className="p-4">
        {outputType === "image" ? (
          <div className="p-4 rounded-lg bg-gray-700">
            <img
              src={aiOutput}
              alt="AI generated output"
              className="max-w-full h-auto rounded border"
            />
          </div>
        ) : (
          <div
            className={`max-h-[750px] overflow-y-scroll p-4 rounded-lg ${
              outputType === "code"
                ? "bg-gray-900 text-gray-100 font-mono text-sm"
                : "bg-gray-700 text-gray-200"
            }`}
          >
            <pre className="whitespace-pre-wrap break-words">
              {aiOutput}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIOutputDisplay;