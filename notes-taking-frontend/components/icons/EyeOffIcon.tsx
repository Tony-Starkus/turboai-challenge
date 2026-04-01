const EyeOffIcon = ({ size = 18 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 3l18 18" />
    <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
    <path d="M9.9 5.1A11.5 11.5 0 0 1 12 5c6.5 0 10 7 10 7a16.2 16.2 0 0 1-4.1 4.7" />
    <path d="M6.2 6.2A16.6 16.6 0 0 0 2 12s3.5 7 10 7c1.7 0 3.2-.4 4.5-1" />
  </svg>
);

export default EyeOffIcon;
