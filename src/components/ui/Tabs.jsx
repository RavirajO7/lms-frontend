export default function Tabs({ tabs, active, onChange }) {
  return (
    <div className="flex gap-2 border-b mb-4">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => onChange(t)}
          className={`px-4 py-2 text-sm font-medium ${
            active === t
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500"
          }`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
