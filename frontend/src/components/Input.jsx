export default function Input({ label, id, className = '', ...props }) {
  return (
    <label className="block space-y-2 text-sm text-slate-600" htmlFor={id}>
      <span className="font-medium text-slate-700">{label}</span>
      <input
        id={id}
        className={`h-11 w-full rounded-sm border border-slate-300 bg-white px-4 text-[15px] text-slate-900 placeholder:text-slate-400 outline-none transition focus:border-[#f18f80] focus:ring-2 focus:ring-[#f18f80]/20 ${className}`}
        {...props}
      />
    </label>
  );
}