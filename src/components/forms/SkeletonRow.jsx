import React from "react";

const SkeletonRow = ({ columns }) => {
  return (
    <tr className="animate-pulse">
      {columns.map((column, index) => (
        <td key={index} className="px-6 py-4 whitespace-nowrap">
          <div className="h-4 bg-gray-200 rounded"></div>
        </td>
      ))}
    </tr>
  );
};

export default SkeletonRow;