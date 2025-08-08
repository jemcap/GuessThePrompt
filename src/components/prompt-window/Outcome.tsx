import React from "react";
import type { OutcomeProps } from "../../types/OutcomeProps";

const Outcome = ({
  outcome,
  outcomeType,
  difficulty,
  isLoading,
}: OutcomeProps) => {
  if (isLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (outcomeType) {
      case "text":
        return (
          <div className="prose max-w-none p-4">
            <div className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-400">
              <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                {outcome}
              </p>
            </div>
          </div>
        );
      case "code":
        return (
          <div className="relative">
            <div className="absolute top-2 right-2">
              <button
                className="text-xs text-gray-500 hover:text-gray-700 px-2 py-1 rounded bg-gray-100 
  hover:bg-gray-200 transition-colors"
              >
                Copy
              </button>
            </div>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm font-mono">
              <code>{outcome}</code>
            </pre>
          </div>
        );
    }
  };
  return (
    <div className="relative">


      {/* Content */}
      <div className="p-4">{renderContent()}</div>
    </div>
  );
};

export default Outcome;
