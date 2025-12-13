import { useEffect, useState } from "react";
import { getSyllabus, deleteSyllabus } from "../api/syllabus.api";
import SyllabusFormModal from "../components/syllabus/SyllabusFormModal";
import { useNavigate } from "react-router-dom";

export default function SyllabusList() {
  const user = JSON.parse(localStorage.getItem("user"));
  const isTeacher = user.role === "TEACHER";

  const [list, setList] = useState([]);
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const navigate = useNavigate();

  async function load() {
    const res = await getSyllabus();
    setList(res.data);
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="container">
      <div className="flex justify-between mb-4">
        <h1 className="text-xl font-semibold">Syllabus</h1>
        {!isTeacher && (
          <button
            onClick={() => setOpen(true)}
            className="btn-primary"
          >
            + Create Syllabus
          </button>
        )}
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Year</th>
            <th>Class</th>
            <th>Branch</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {list.map((s) => (
            <tr key={s._id}>
              <td>{s.academicYear}</td>
              <td>{s.class?.name}</td>
              <td>{s.isGlobal ? "ALL" : s.branch?.name}</td>
              <td>{s.status}</td>
              <td className="space-x-2">
                <button
                  onClick={() => navigate(`/syllabus/${s._id}`)}
                  className="text-blue-600"
                >
                  Manage
                </button>

                {!isTeacher && s.status === "DRAFT" && (
                  <>
                    <button
                      onClick={() => {
                        setEditData(s);
                        setOpen(true);
                      }}
                      className="text-green-600"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => deleteSyllabus(s._id).then(load)}
                      className="text-red-600"
                    >
                      Delete
                    </button>
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <SyllabusFormModal
        open={open}
        onClose={() => {
          setOpen(false);
          setEditData(null);
        }}
        editData={editData}
        onSuccess={load}
      />
    </div>
  );
}
