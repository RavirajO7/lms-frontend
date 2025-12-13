import { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import Spinner from "../ui/Spinner";
import API from "../../api/api";

export default function SyllabusModal({
  open,
  onClose,
  onSuccess,
  editData,
}) {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isSuperAdmin = user.role === "SUPER_ADMIN";

  const [academicYear, setAcademicYear] = useState("");
  const [branchId, setBranchId] = useState("");
  const [classId, setClassId] = useState("");
  const [description, setDescription] = useState("");

  const [branches, setBranches] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchClasses();
    if (isSuperAdmin) fetchBranches();
  }, []);

  useEffect(() => {
    if (editData) {
      setAcademicYear(editData.academicYear);
      setClassId(editData.class._id);
      setBranchId(editData.branch._id);
      setDescription(editData.description || "");
    } else {
      resetForm();
    }
  }, [editData]);

  function resetForm() {
    setAcademicYear("");
    setClassId("");
    setDescription("");
    setBranchId(isSuperAdmin ? "" : user.branch);
    setErrors({});
  }

  async function fetchBranches() {
    const res = await API.get("/branches/all");
    setBranches(res.data);
  }

  async function fetchClasses() {
    const res = await API.get("/classes/all");
    setClasses(res.data);
  }

  function validate() {
    const e = {};
    if (!academicYear) e.academicYear = "Academic year is required";
    if (!branchId) e.branchId = "Branch is required";
    if (!classId) e.classId = "Class is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const payload = {
        academicYear,
        branch: branchId,
        class: classId,
        description,
      };

      if (editData) {
        await API.put(`/syllabus/${editData._id}`, payload);
      } else {
        await API.post("/syllabus", payload);
      }

      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editData ? "Edit Syllabus" : "Create Syllabus"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Academic Year */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Academic Year <span className="text-red-500">*</span>
          </label>
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select year</option>
            <option value="2025-26">2025–26</option>
            <option value="2026-27">2026–27</option>
            <option value="2027-28">2027–28</option>
          </select>
          {errors.academicYear && (
            <p className="text-red-500 text-xs mt-1">
              {errors.academicYear}
            </p>
          )}
        </div>

        {/* Branch */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Branch <span className="text-red-500">*</span>
          </label>
          <select
            value={branchId}
            onChange={(e) => setBranchId(e.target.value)}
            className="w-full border rounded px-3 py-2"
            disabled={!isSuperAdmin}
          >
            <option value="">Select branch</option>
            {branches.map((b) => (
              <option key={b._id} value={b._id}>
                {b.name}
              </option>
            ))}
          </select>
          {errors.branchId && (
            <p className="text-red-500 text-xs mt-1">
              {errors.branchId}
            </p>
          )}
        </div>

        {/* Class */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Class <span className="text-red-500">*</span>
          </label>
          <select
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            className="w-full border rounded px-3 py-2"
          >
            <option value="">Select class</option>
            {classes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.classId && (
            <p className="text-red-500 text-xs mt-1">
              {errors.classId}
            </p>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-1">
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border rounded px-3 py-2"
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
            disabled={loading}
          >
            {loading && <Spinner />}
            Save
          </button>
        </div>
      </form>
    </Modal>
  );
}
