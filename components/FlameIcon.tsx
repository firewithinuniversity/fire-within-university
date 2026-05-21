type Props = {
  className?: string;
  size?: number;
};

export default function FlameIcon({ className = "", size = 32 }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M24 4C24 4 12 16 12 28a12 12 0 0 0 24 0C36 16 24 4 24 4Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path
        d="M24 18c0 0-6 6-6 14a6 6 0 0 0 12 0c0-8-6-14-6-14Z"
        fill="#E08A3A"
        opacity="0.9"
      />
    </svg>
  );
}
