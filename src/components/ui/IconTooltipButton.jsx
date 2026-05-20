import React from "react";

const IconTooltipButton = ({
  label,
  children,
  className = "",
  tooltipClassName = "",
  ...props
}) => {
  return (
    <button
      {...props}
      aria-label={props["aria-label"] || label}
      title={props.title || label}
      className={`group relative ${className}`}
    >
      {children}
      {/* <span
        className={`pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-[calc(100%+0.5rem)] whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs font-medium text-white opacity-0 shadow-lg transition-all duration-150 group-hover:opacity-100 group-hover:-translate-y-[calc(100%+0.75rem)] group-focus-visible:opacity-100 group-focus-visible:-translate-y-[calc(100%+0.75rem)] ${tooltipClassName}`}
      >
        {label}
      </span> */}
    </button>
  );
};

export default IconTooltipButton;
