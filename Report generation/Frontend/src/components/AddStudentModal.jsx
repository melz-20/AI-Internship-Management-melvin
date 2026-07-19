import { useState } from "react";
import { FiX } from "react-icons/fi";

const createFormData = (student) => ({
  studentId: student?.student_id ?? "",
  name: student?.student_name ?? "",
  department: student?.department ?? "Cyber Security",
  company: student?.company ?? "Cisco",
  attendance: student?.attendance ?? "",
  taskCompletion: student?.task_completion ?? "",
  mentorRating: student?.mentor_rating ?? "",
  communication: student?.communication ?? "",
  projectCompletion: student?.project_completion ?? "",
});

function AddStudentModal({ initialStudent, onClose, onSave }) {
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [formData, setFormData] = useState(() => createFormData(initialStudent));
  const isEditing = Boolean(initialStudent);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
    setFormData(createFormData());
    setSaveError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();
    setIsSaving(true);
    setSaveError("");

    try {
      await onSave(formData);
      resetForm();
      onClose();
    } catch (error) {
      setSaveError(error.message || "Unable to save student.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <form onSubmit={handleSave} className="bg-white rounded-3xl w-[650px] p-8">

        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">
            {isEditing ? "Edit Student" : "Add New Student"}
          </h2>

          <button type="button" onClick={onClose}>
            <FiX size={28}/>
          </button>
        </div>

        <div className="grid grid-cols-2 gap-5 mt-8">

          <div>
            <label>Student Name</label>

            <input
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full mt-2 border rounded-xl p-3"
            />
          </div>

          <div>
            <label>Student ID</label>

            <input
              name="studentId"
              value={formData.studentId}
              readOnly={isEditing}
              className="w-full mt-2 border rounded-xl p-3"
            />
          </div>

          <div>
            <label>Department</label>

            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full mt-2 border rounded-xl p-3"
            >
              <option>Cyber Security</option>
              <option>CSE</option>
              <option>AI & ML</option>
              <option>IT</option>
              <option>ECE</option>
            </select>
          </div>

          <div>
            <label>Company</label>

            <select
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full mt-2 border rounded-xl p-3"
            >
              <option>Cisco</option>
              <option>Google</option>
              <option>Infosys</option>
              <option>TCS</option>
              <option>IBM</option>
            </select>
          </div>

          <div>
            <label>Attendance (%)</label>

            <input
              name="attendance"
              type="number"
              value={formData.attendance}
              onChange={handleChange}
              min="0"
              max="100"
              required
              className="w-full mt-2 border rounded-xl p-3"
            />
          </div>

          <div>
            <label>Task Completion (%)</label>

            <input
              name="taskCompletion"
              type="number"
              value={formData.taskCompletion}
              onChange={handleChange}
              min="0"
              max="100"
              required
              className="w-full mt-2 border rounded-xl p-3"
            />
          </div>

          <div>
            <label>Mentor Rating</label>

            <input
              name="mentorRating"
              type="number"
              value={formData.mentorRating}
              onChange={handleChange}
              min="1"
              max="5"
              step="0.1"
              required
              className="w-full mt-2 border rounded-xl p-3"
            />
          </div>

          <div>
            <label>Communication (%)</label>

            <input
              name="communication"
              type="number"
              value={formData.communication}
              onChange={handleChange}
              min="0"
              max="100"
              required
              className="w-full mt-2 border rounded-xl p-3"
            />
          </div>

          <div className="col-span-2">
            <label>Project Completion (%)</label>

            <input
              name="projectCompletion"
              type="number"
              value={formData.projectCompletion}
              onChange={handleChange}
              min="0"
              max="100"
              required
              className="w-full mt-2 border rounded-xl p-3"
            />
          </div>

        </div>

        {saveError && (
          <p className="mt-5 text-sm text-red-500">{saveError}</p>
        )}

        <div className="flex justify-end gap-4 mt-8">

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 rounded-xl bg-gray-200"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-3 rounded-xl bg-violet-600 text-white hover:bg-violet-700"
          >
            {isSaving ? "Saving..." : isEditing ? "Update Student" : "Save Student"}
          </button>

        </div>

      </form>
    </div>
  );
}

export default AddStudentModal;
