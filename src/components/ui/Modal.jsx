export default function Modal({ children, onClose }) {
  return (
    <div className=" modal-overlay fixed inset-0 bg-black/50 flex justify-center items-center z-[9999]">
      
      <div className="relative bg-white shadow-2xl rounded-xl w-[450px] p-6">

        {/* FLOATING CROSS BUTTON */}
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-white h-10 w-10 rounded-full shadow-md border text-xl font-bold flex justify-center items-center hover:bg-gray-100"
        >
          ×
        </button>

        {children}
      </div>
    </div>
  );
}
