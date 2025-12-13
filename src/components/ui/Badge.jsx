export default function Badge({ status }) {
  const map = {
    DRAFT: "bg-gray-200 text-gray-700",
    ACTIVE: "bg-green-100 text-green-700",
    ARCHIVED: "bg-red-100 text-red-700",
  };

  return (
    <span
      className={`px-2 py-1 rounded text-xs font-medium ${
        map[status] || "bg-gray-100"
      }`}
    >
      {status}
    </span>
  );
}
