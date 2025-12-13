import Modal from "../ui/Modal";
import Spinner from "../ui/Spinner";

export default function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  loading,
}) {
  return (
    <Modal open={open} onClose={onClose} title="Delete Syllabus">
      <p className="text-sm text-gray-600 mb-4">
        Are you sure? This action cannot be undone.
      </p>

      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-4 py-2 border rounded">
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded flex items-center gap-2"
          disabled={loading}
        >
          {loading && <Spinner />}
          Delete
        </button>
      </div>
    </Modal>
  );
}
