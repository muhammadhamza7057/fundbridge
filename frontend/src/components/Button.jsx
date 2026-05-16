export default function Button({ children, className = '', as: Component = 'button', type = 'button', ...props }) {
  const resolvedType = Component === 'button' ? type : undefined;

  return (
    <Component
      type={resolvedType}
      className={`inline-flex items-center justify-center rounded-full bg-[#d8e75f] px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-[#cfe04e] focus:outline-none focus:ring-2 focus:ring-[#d8e75f]/40 focus:ring-offset-2 focus:ring-offset-[#2c2c2c] disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}