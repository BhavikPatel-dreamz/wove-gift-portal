
"use client";
import { useState } from "react";

export function Tabs({ children, defaultTab }) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  const handleClick = (tab) => {
    setActiveTab(tab);
  };

  return (
    <div>
      <div className="flex border-b">
        {children.map((child) => {
          const { name, label } = child.props;
          return (
            <button
              key={name}
              className={`${
                activeTab === name
                  ? "border-b-2 border-blue-500 text-blue-600"
                  : "border-b-2 border-transparent text-gray-500 hover:text-gray-700"
              } px-4 py-2 transition-colors duration-300 ease-in-out`}
              onClick={() => handleClick(name)}
            >
              {label}
            </button>
          );
        })}
      </div>
      <div>
        {children.map((child) => {
          const { name } = child.props;
          if (name === activeTab) {
            return <div key={name}>{child.props.children}</div>;
          }
          return null;
        })}
      </div>
    </div>
  );
}

export function Tab({ name, label, children }) {
  return (
    <div name={name} label={label}>
      {children}
    </div>
  );
}
