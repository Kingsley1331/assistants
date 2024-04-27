const UploadIcon = ({ opacity = 1 }) => {
  return (
    <svg version="1.1" width="256" height="256" viewBox="0 0 256 256">
      <defs></defs>
      <g
        // style="stroke: none; stroke-width: 0; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: none; fill-rule: nonzero; opacity: 1;"
        style={{
          stroke: "none",
          strokeWidth: 0,
          strokeDasharray: "none",
          strokeLinecap: "butt",
          strokeLinejoin: "miter",
          strokeMiterlimit: 10,
          fill: "none",
          fillRule: "nonzero",
          opacity,
        }}
        transform="translate(1.4065934065934016 1.4065934065934016) scale(2.81 2.81)"
      >
        <path
          d="M 56.38 87.734 c -0.74 0 -1.471 -0.273 -2.036 -0.796 L 29.772 64.254 H 3 c -1.657 0 -3 -1.343 -3 -3 V 28.747 c 0 -1.657 1.343 -3 3 -3 h 26.772 L 54.344 3.062 c 0.876 -0.809 2.146 -1.022 3.238 -0.544 c 1.092 0.478 1.797 1.557 1.797 2.748 v 79.468 c 0 1.191 -0.705 2.271 -1.797 2.748 C 57.195 87.652 56.786 87.734 56.38 87.734 z"
          //   style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;"
          style={{
            stroke: "none",
            strokeWidth: 1,
            strokeDasharray: "none",
            strokeLinecap: "butt",
            strokeLinejoin: "miter",
            strokeMiterlimit: 10,
            fill: "rgb(0,0,0)",
            fillRule: "nonzero",
            opacity: 1,
          }}
          transform=" matrix(1 0 0 1 0 0) "
          stroke-linecap="round"
        />
        <path
          d="M 81.658 45 l 7.463 -7.464 c 1.172 -1.171 1.172 -3.071 0 -4.243 c -1.172 -1.171 -3.07 -1.171 -4.242 0 l -7.463 7.464 l -7.463 -7.464 c -1.172 -1.172 -3.07 -1.171 -4.242 0 c -1.172 1.172 -1.172 3.071 0 4.243 L 73.173 45 l -7.463 7.464 c -1.172 1.172 -1.172 3.071 0 4.242 c 0.586 0.586 1.354 0.879 2.121 0.879 s 1.535 -0.293 2.121 -0.879 l 7.463 -7.464 l 7.463 7.464 c 0.586 0.586 1.354 0.879 2.121 0.879 s 1.535 -0.293 2.121 -0.879 c 1.172 -1.171 1.172 -3.07 0 -4.242 L 81.658 45 z"
          style={{
            stroke: "none",
            strokeWidth: 1,
            strokeDasharray: "none",
            strokeLinecap: "butt",
            strokeLinejoin: "miter",
            strokeMiterlimit: 10,
            fill: "rgb(0,0,0)",
            fillRule: "nonzero",
            opacity: 1,
          }}
          //   style="stroke: none; stroke-width: 1; stroke-dasharray: none; stroke-linecap: butt; stroke-linejoin: miter; stroke-miterlimit: 10; fill: rgb(0,0,0); fill-rule: nonzero; opacity: 1;"
          transform=" matrix(1 0 0 1 0 0) "
          stroke-linecap="round"
        />
      </g>
    </svg>
  );
};

export default UploadIcon;
