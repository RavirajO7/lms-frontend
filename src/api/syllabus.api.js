import API from "./api";

export const listSyllabus = () => API.get("/syllabus");

export const loadSyllabus = (params) =>
  API.get("/syllabus/load", { params });

export const updateSyllabus = (id, data) =>
  API.put(`/syllabus/${id}`, data);

export const deleteSyllabus = (id) =>
  API.delete(`/syllabus/${id}`);
