import React, { useMemo, useState } from "react";
import { X, CheckCircle2, XCircle, PauseCircle, PlayCircle, Loader2, UserPlus, UserMinus } from "lucide-react";
import { updateProject, addProjectMembers, removeProjectMember } from "../api/client";

const STATUS_STYLES = {
  completed: "bg-status-completedBg text-status-completed",
  active: "bg-status-progressBg text-status-progress",
  overdue: "bg-status-overdueBg text-status-overdue",
  dropped: "bg-status-droppedBg text-status-dropped",
  on_hold: "bg-status-holdBg text-status-hold",
};

const STATUS_TEXT_LABELS = {
  completed: "Completed", active: "Active", overdue: "Overdue", dropped: "Dropped", on_hold: "On Hold",
};

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

/**
 * Right-hand slide-over panel for a single project: full details
 * (including phase), team roster, an editable progress slider, and status
 * actions - mark completed, put on hold / resume, or drop with a required
 * reason. Calls `onUpdated` after any successful change so the parent page
 * can refresh its list + the shared dashboard context.
 */
export default function ProjectDrawer({ project, employees = [], onClose, onUpdated }) {
  const [progress, setProgress] = useState(project.progress_percent);
  const [phase, setPhase] = useState(project.phase || "");
  const [manager, setManager] = useState(project.project_manager || "");
  const [startDate, setStartDate] = useState(project.start_date || "");
  const [deadline, setDeadline] = useState(project.deadline || "");
  const [saving, setSaving] = useState(false);
  const [dropReason, setDropReason] = useState("");
  const [showDropForm, setShowDropForm] = useState(false);
  const [error, setError] = useState("");

  const [showAddPeople, setShowAddPeople] = useState(false);
  const [selectedNewIds, setSelectedNewIds] = useState([]);
  const [newMemberRole, setNewMemberRole] = useState("");
  const [addingPeople, setAddingPeople] = useState(false);
  const [removingId, setRemovingId] = useState(null);

  const currentTeamIds = new Set((project?.team || []).map((m) => m.employee_id));
  const availableToAdd = useMemo(
    () => employees.filter((e) => !currentTeamIds.has(e.id)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [employees, project?.team]
  );

  if (!project) return null;
  const displayStatus = project.is_overdue ? "overdue" : project.status;
  const isEditable = project.status === "active" || project.status === "on_hold";

  async function runUpdate(payload, errorMessage) {
    setSaving(true);
    setError("");
    try {
      const updated = await updateProject(project.id, payload);
      onUpdated(updated);
      return updated;
    } catch (err) {
      setError(err?.response?.data?.detail || errorMessage);
    } finally {
      setSaving(false);
    }
  }

  const saveProgress = () => runUpdate({ progress_percent: Number(progress) }, "Could not update progress.");
  const savePhase = () => runUpdate({ phase: phase.trim() || null }, "Could not update phase.");
  const saveManager = () => runUpdate({ project_manager: manager.trim() || null }, "Could not update the project manager.");

  const saveDates = () => {
    if (startDate && deadline && deadline < startDate) {
      setError("Deadline cannot be before the start date.");
      return;
    }
    return runUpdate({ start_date: startDate || null, deadline: deadline || null }, "Could not update the dates.");
  };

  const markCompleted = () => runUpdate({ status: "completed" }, "Could not mark as completed.");
  const reopenProject = () => runUpdate({ status: "active" }, "Could not reopen the project.");
  const putOnHold = () => runUpdate({ status: "on_hold" }, "Could not put the project on hold.");
  const resumeFromHold = () => runUpdate({ status: "active" }, "Could not resume the project.");

  async function confirmDrop() {
    if (!dropReason.trim()) {
      setError("A reason is required to drop a project.");
      return;
    }
    const updated = await runUpdate(
      { status: "dropped", drop_reason: dropReason.trim() },
      "Could not drop the project."
    );
    if (updated) setShowDropForm(false);
  }

  function toggleNewMember(id) {
    setSelectedNewIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function handleAddMembers() {
    if (selectedNewIds.length === 0) {
      setError("Select at least one person to add.");
      return;
    }
    setAddingPeople(true);
    setError("");
    try {
      const updated = await addProjectMembers(project.id, selectedNewIds, newMemberRole.trim());
      onUpdated(updated);
      setSelectedNewIds([]);
      setNewMemberRole("");
      setShowAddPeople(false);
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not add people to this project.");
    } finally {
      setAddingPeople(false);
    }
  }

  async function handleRemoveMember(employeeId) {
    setRemovingId(employeeId);
    setError("");
    try {
      const updated = await removeProjectMember(project.id, employeeId);
      onUpdated(updated);
    } catch (err) {
      setError(err?.response?.data?.detail || "Could not remove this person from the project.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />

      {/* Panel */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 overflow-y-auto">
        <div className="flex items-start justify-between mb-5">
          <div>
            <h2 className="text-lg font-bold text-ink">{project.name}</h2>
            <span className={`inline-flex mt-2 px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_STYLES[displayStatus]}`}>
              {displayStatus === "overdue" ? "Overdue" : STATUS_TEXT_LABELS[displayStatus]}
            </span>
          </div>
          <button onClick={onClose} className="text-ink-faint hover:text-ink p-1">
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-sm font-semibold text-ink mb-2">Dates</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-ink-faint text-xs mb-1">Start Date</p>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                disabled={!isEditable}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:bg-surface-muted disabled:text-ink-faint"
              />
            </div>
            <div>
              <p className="text-ink-faint text-xs mb-1">Deadline</p>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                disabled={!isEditable}
                className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:bg-surface-muted disabled:text-ink-faint"
              />
            </div>
          </div>
          {isEditable && (
            <button
              onClick={saveDates}
              disabled={saving}
              className="mt-2 text-xs font-semibold text-accent hover:text-accent-hover disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save dates"}
            </button>
          )}
          {project.actual_completion_date && (
            <div className="mt-3">
              <p className="text-ink-faint text-xs mb-0.5">Completed On</p>
              <p className="font-medium text-ink text-sm">{formatDate(project.actual_completion_date)}</p>
            </div>
          )}
          {project.drop_reason && (
            <div className="mt-3">
              <p className="text-ink-faint text-xs mb-0.5">Drop Reason</p>
              <p className="font-medium text-ink text-sm">{project.drop_reason}</p>
            </div>
          )}
        </div>

        {/* Phase editor */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-ink mb-2">Phase</p>
          <div className="flex items-center gap-2">
            <input
              value={phase}
              onChange={(e) => setPhase(e.target.value)}
              placeholder="e.g. Planning, Development, Testing"
              disabled={!isEditable}
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:bg-surface-muted disabled:text-ink-faint"
            />
            {isEditable && (
              <button
                onClick={savePhase}
                disabled={saving}
                className="text-xs font-semibold text-accent hover:text-accent-hover disabled:opacity-50 shrink-0"
              >
                Save
              </button>
            )}
          </div>
        </div>

        {/* Progress editor */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-ink">Progress</p>
            <span className="text-sm text-ink-soft">{progress}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={(e) => setProgress(e.target.value)}
            className="w-full accent-accent"
            disabled={!isEditable}
          />
          {isEditable && (
            <button
              onClick={saveProgress}
              disabled={saving}
              className="mt-2 text-xs font-semibold text-accent hover:text-accent-hover disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save progress"}
            </button>
          )}
        </div>

        {/* Project Manager */}
        <div className="mb-6">
          <p className="text-sm font-semibold text-ink mb-2">Project Manager</p>
          <div className="flex items-center gap-2">
            <input
              value={manager}
              onChange={(e) => setManager(e.target.value)}
              placeholder="Not assigned"
              disabled={!isEditable}
              className="flex-1 text-sm border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-accent/40 disabled:bg-surface-muted disabled:text-ink-faint"
            />
            {isEditable && (
              <button
                onClick={saveManager}
                disabled={saving}
                className="text-xs font-semibold text-accent hover:text-accent-hover disabled:opacity-50 shrink-0"
              >
                Save
              </button>
            )}
          </div>
        </div>

        {/* Team */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold text-ink">Team ({project.team?.length || 0})</p>
            {isEditable && (
              <button
                onClick={() => setShowAddPeople((s) => !s)}
                className="flex items-center gap-1 text-xs font-semibold text-accent hover:text-accent-hover"
              >
                <UserPlus size={13} />
                Add People
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {(project.team || []).length === 0 ? (
              <p className="text-sm text-ink-faint">No one assigned yet.</p>
            ) : (
              project.team.map((m) => (
                <div key={m.employee_id} className="flex items-center justify-between text-sm bg-surface-muted rounded-lg px-3 py-2">
                  <div>
                    <span className="font-medium text-ink">{m.name}</span>
                    {m.role_on_project && <span className="text-ink-faint text-xs ml-2">{m.role_on_project}</span>}
                  </div>
                  {isEditable && (
                    <button
                      onClick={() => handleRemoveMember(m.employee_id)}
                      disabled={removingId === m.employee_id}
                      className="text-ink-faint hover:text-status-overdue disabled:opacity-50"
                      title={`Remove ${m.name} from this project`}
                    >
                      {removingId === m.employee_id ? <Loader2 size={14} className="animate-spin" /> : <UserMinus size={14} />}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {showAddPeople && (
            <div className="mt-3 border border-gray-200 rounded-xl p-3">
              {availableToAdd.length === 0 ? (
                <p className="text-xs text-ink-faint">
                  Everyone in the system is already on this project. Add a new person from the People page first.
                </p>
              ) : (
                <>
                  <div className="max-h-32 overflow-y-auto space-y-1 mb-2">
                    {availableToAdd.map((emp) => (
                      <label key={emp.id} className="flex items-center gap-2 text-sm px-2 py-1.5 rounded-lg hover:bg-surface-muted cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedNewIds.includes(emp.id)}
                          onChange={() => toggleNewMember(emp.id)}
                          className="accent-accent"
                        />
                        <span className="text-ink">{emp.name}</span>
                        <span className="text-ink-faint text-xs">{emp.role}</span>
                      </label>
                    ))}
                  </div>
                  <input
                    value={newMemberRole}
                    onChange={(e) => setNewMemberRole(e.target.value)}
                    placeholder="Role on this project (optional)"
                    className="w-full text-sm border border-gray-200 rounded-xl px-3 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-accent/40"
                  />
                  <button
                    onClick={handleAddMembers}
                    disabled={addingPeople || selectedNewIds.length === 0}
                    className="w-full flex items-center justify-center gap-1.5 bg-accent text-white text-sm font-semibold rounded-xl py-2 hover:bg-accent-hover disabled:opacity-50"
                  >
                    {addingPeople && <Loader2 size={14} className="animate-spin" />}
                    {addingPeople ? "Adding…" : `Add ${selectedNewIds.length || ""} ${selectedNewIds.length === 1 ? "Person" : "People"}`.trim()}
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {error && <p className="text-xs text-status-overdue mb-3">{error}</p>}

        {/* Actions */}
        {project.status === "active" && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={markCompleted}
              disabled={saving}
              className="col-span-2 flex items-center justify-center gap-1.5 bg-status-completed text-white text-sm font-semibold rounded-xl py-2.5 hover:opacity-90 disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
              Mark Completed
            </button>
            <button
              onClick={putOnHold}
              disabled={saving}
              className="flex items-center justify-center gap-1.5 bg-status-hold text-white text-sm font-semibold rounded-xl py-2.5 hover:opacity-90 disabled:opacity-50"
            >
              <PauseCircle size={16} />
              Put On Hold
            </button>
            <button
              onClick={() => setShowDropForm((s) => !s)}
              disabled={saving}
              className="flex items-center justify-center gap-1.5 bg-status-dropped text-white text-sm font-semibold rounded-xl py-2.5 hover:opacity-90 disabled:opacity-50"
            >
              <XCircle size={16} />
              Drop Project
            </button>
          </div>
        )}

        {project.status === "on_hold" && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={resumeFromHold}
              disabled={saving}
              className="flex items-center justify-center gap-1.5 bg-status-progress text-white text-sm font-semibold rounded-xl py-2.5 hover:opacity-90 disabled:opacity-50"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <PlayCircle size={16} />}
              Resume Project
            </button>
            <button
              onClick={() => setShowDropForm((s) => !s)}
              disabled={saving}
              className="flex items-center justify-center gap-1.5 bg-status-dropped text-white text-sm font-semibold rounded-xl py-2.5 hover:opacity-90 disabled:opacity-50"
            >
              <XCircle size={16} />
              Drop Project
            </button>
          </div>
        )}

        {(project.status === "completed" || project.status === "dropped") && (
          <button
            onClick={reopenProject}
            disabled={saving}
            className="w-full flex items-center justify-center gap-1.5 border border-accent text-accent text-sm font-semibold rounded-xl py-2.5 hover:bg-accent/5 disabled:opacity-50"
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
            Reopen as Active
          </button>
        )}

        {showDropForm && (
          <div className="mt-3 space-y-2">
            <textarea
              value={dropReason}
              onChange={(e) => setDropReason(e.target.value)}
              placeholder="Why is this project being dropped? (required)"
              className="w-full text-sm border border-gray-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-accent/40"
              rows={3}
            />
            <button
              onClick={confirmDrop}
              disabled={saving}
              className="w-full bg-status-dropped text-white text-sm font-semibold rounded-xl py-2.5 hover:opacity-90 disabled:opacity-50"
            >
              {saving ? "Dropping…" : "Confirm Drop"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
