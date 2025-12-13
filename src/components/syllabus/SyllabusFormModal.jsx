import { useEffect, useState } from "react";
import Modal from "../ui/Modal";
import { createSyllabus, updateSyllabus } from "../../api/syllabus.api";
import API from "../../api/api";

export default function SyllabusFormModal({ open, onClose, editData, onSuccess }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const isSuperAdmin = user.role === "SUPER_ADMIN";

  const [academicYear, setAcademicYear] = useState("");
  const [classId, setClassId] = useState("");
  const [branch, setBranch] = useState("");
  const [classes, setClasses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    API.get("/classes/all").then(r => setClasses(r.data));
    if (isSuperAdmin)
      API.get("/branches/all").then(r => setBranches(r.data));
  }, []);

  useEffect(() => {
    if (editData) {
      setAcademicYear(editData.academicYear);
      setClassId(editData.class._id);
      setBranch(editData.isGlobal ? "ALL" : editData.branch?._id);
    }
  }, [editData]);

  async function submit() {
    if (!academicYear || !classId || !branch) {
      setError("All fields are required");
      return;
    }

    const payload = {
      academicYear,
      class: classId,
      isGlobal: branch === "ALL",
      branch: branch === "ALL" ? null : branch,
    };

    editData
      ? await updateSyllabus(editData._id, payload)
      : await createSyllabus(payload);

    onSuccess();
    onClose();
  }

  return (
    <Modal open={open} onClose={onClose} title="Syllabus">
      <div className="space-y-3">
        {error && <p className="text-red-500 text-sm">{error}</p>}

        <input
          placeholder="Academic Year (2026-27)"
          value={academicYear}
          onChange={(e) => setAcademicYear(e.target.value)}
        />

        <select value={classId} onChange={(e) => setClassId(e.target.value)}>
          <option value="">Select Class</option>
          {classes.map(c => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>

        {isSuperAdmin && (
          <select value={branch} onChange={(e) => setBranch(e.target.value)}>
            <option value="">Select Branch</option>
            <option value="ALL">ALL BRANCHES</option>
            {branches && branches?.map(b => (
              <option key={b._id} value={b._id}>{b.name}</option>
            ))}
          </select>
        )}

        <button onClick={submit} className="btn-primary w-full">
          Save
        </button>
      </div>
    </Modal>
  );
}
