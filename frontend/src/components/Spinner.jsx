export default function Spinner({ size = 'md', color = 'primary' }) {
  const sizes = { sm: 'w-4 h-4 border-2', md: 'w-7 h-7 border-2', lg: 'w-12 h-12 border-3' };
  const colors = { primary: 'border-primary-500', white: 'border-white' };
  return (
    <div className={`${sizes[size]} ${colors[color]} border-t-transparent rounded-full animate-spin`} />
  );
}
