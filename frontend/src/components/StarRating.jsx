export default function StarRating({ rating = 0, max = 5, size = 'sm', interactive = false, onChange }) {
  const sizes = { sm: 'text-sm', md: 'text-base', lg: 'text-xl' };
  return (
    <div className={`flex gap-0.5 ${sizes[size]}`}>
      {Array.from({ length: max }).map((_, i) => {
        const filled = i < Math.floor(rating);
        const partial = !filled && i < rating;
        return (
          <span
            key={i}
            onClick={() => interactive && onChange?.(i + 1)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            style={{ color: filled || partial ? '#e8b800' : '#d1d5db', position: 'relative', display: 'inline-block' }}
          >
            {partial ? (
              <span style={{ position: 'relative', display: 'inline-block' }}>
                <span style={{ color: '#d1d5db' }}>★</span>
                <span style={{ position: 'absolute', left: 0, top: 0, width: `${(rating % 1) * 100}%`, overflow: 'hidden', color: '#e8b800' }}>★</span>
              </span>
            ) : '★'}
          </span>
        );
      })}
    </div>
  );
}
