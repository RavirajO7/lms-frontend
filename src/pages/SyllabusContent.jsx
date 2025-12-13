import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Tabs from "../components/ui/Tabs";
import {
  getContent,
  addContent,
  deleteContent,
} from "../api/syllabus.api";

const MONTHS = [
  "APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER",
  "OCTOBER","NOVEMBER","DECEMBER","JANUARY","FEBRUARY","MARCH"
];

export default function SyllabusContent() {
  const { id } = useParams();
  const user = JSON.parse(localStorage.getItem("user"));
  const isTeacher = user.role === "TEACHER";

  const [month, setMonth] = useState("APRIL");
  const [rows, setRows] = useState([]);
  const [newRow, setNewRow] = useState({
    subjectName: "",
    written: "",
    oral: "",
    rhymes: "",
    activity: "",
  });

  async function load() {
    const res = await getContent(id);
    setRows(res.data.filter(r => r.month === month));
  }

  useEffect(() => {
    load();
  }, [month]);

  async function addRow() {
    await addContent(id, { ...newRow, month });
    setNewRow({ subjectName: "", written: "", oral: "", rhymes: "", activity: "" });
    load();
  }

  return (
    <div className="container">
      <Tabs tabs={MONTHS} active={month} onChange={setMonth} />

      <table className="table">
        <thead>
          <tr>
            <th>Subject</th>
            <th>Written</th>
            <th>Oral</th>
            <th>Rhymes</th>
            <th>Activity</th>
            {!isTeacher && <th />}
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r._id}>
              <td>{r.subjectName}</td>
              <td>{r.written}</td>
              <td>{r.oral}</td>
              <td>{r.rhymes}</td>
              <td>{r.activity}</td>
              {!isTeacher && (
                <td>
                  <button
                    onClick={() => deleteContent(r._id).then(load)}
                    className="text-red-600"
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {!isTeacher && (
        <div className="mt-4 space-y-2">
          <input
            placeholder="Subject Name"
            value={newRow.subjectName}
            onChange={e => setNewRow({ ...newRow, subjectName: e.target.value })}
          />
          <textarea placeholder="Written" onChange={e => setNewRow({ ...newRow, written: e.target.value })} />
          <textarea placeholder="Oral" onChange={e => setNewRow({ ...newRow, oral: e.target.value })} />
          <textarea placeholder="Rhymes" onChange={e => setNewRow({ ...newRow, rhymes: e.target.value })} />
          <textarea placeholder="Activity" onChange={e => setNewRow({ ...newRow, activity: e.target.value })} />

          <button onClick={addRow} className="btn-primary">
            + Add Subject
          </button>
        </div>
      )}
    </div>
  );
}
