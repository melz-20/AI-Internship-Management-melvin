import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileSpreadsheet, FileText, FileType, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { uploadDataset, API_BASE_URL } from "../api/client";

/**
 * Drag & drop upload zone for the source dataset (Excel, CSV, Word, PDF,
 * TXT/TSV, JSON, or RTF). Handles the full request lifecycle (idle ->
 * uploading -> success/error) and calls `onProcessed(dashboardPayload)`
 * once the backend has parsed, segregated, and persisted the data, so the
 * parent page can refresh every card/table/chart with a single callback.
 */
export default function FileUploader({ onProcessed }) {
  const [status, setStatus] = useState("idle"); // idle | uploading | success | error
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState("");
  const [detail, setDetail] = useState("");

  const handleFile = useCallback(
    async (file) => {
      setStatus("uploading");
      setProgress(0);
      setMessage("");
      setDetail("");
      try {
        const result = await uploadDataset(file, setProgress);
        setStatus("success");
        setMessage(
          `${result.message} (${result.employees_created} employees, ${result.projects_created} projects, ${result.assignments_created} assignments)`
        );
        onProcessed?.(result.dashboard);
      } catch (err) {
        setStatus("error");
        if (!err.response) {
          // No response at all: the backend likely isn't running, or is on a different port.
          setMessage("Can't reach the backend server.");
          setDetail(
            `Expected it at ${API_BASE_URL}. Check the "Connection" status above the upload box for details on how to fix this.`
          );
        } else if (err.response.status === 404) {
          // A server responded, but with no matching route - almost always means
          // something other than the ProManage API is listening on this port.
          setMessage("The backend responded with \"Not Found\".");
          setDetail(
            `This usually means something other than the ProManage backend is running at ${API_BASE_URL}. See the "Connection" status above for how to fix this.`
          );
        } else {
          setMessage(err.response.data?.detail || "Something went wrong while processing the file.");
          setDetail("");
        }
      }
    },
    [onProcessed]
  );

  const onDrop = useCallback(
    (acceptedFiles) => {
      if (acceptedFiles?.[0]) handleFile(acceptedFiles[0]);
    },
    [handleFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    // Accept is intentionally permissive on MIME type (browsers, especially
    // on Windows, often report generic or incorrect MIME types for CSV/TXT/
    // JSON files) - the backend is the real source of truth on format support.
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
      "text/tab-separated-values": [".tsv"],
      "text/plain": [".txt"],
      "application/json": [".json"],
      "application/rtf": [".rtf"],
      "text/rtf": [".rtf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
      "application/pdf": [".pdf"],
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`card border-2 border-dashed cursor-pointer transition-colors
        ${isDragActive ? "border-accent bg-accent/5" : "border-gray-200 hover:border-accent/50"}
      `}
    >
      <input {...getInputProps()} />

      <div className="flex flex-col items-center justify-center text-center py-8 px-4">
        {status === "uploading" ? (
          <>
            <Loader2 className="animate-spin text-accent mb-3" size={34} />
            <p className="font-semibold text-ink">Processing dataset…</p>
            <p className="text-sm text-ink-soft mt-1">Parsing, segregating, and saving records ({progress}%)</p>
            <div className="w-full max-w-xs h-2 bg-gray-100 rounded-full mt-4 overflow-hidden">
              <div
                className="h-full bg-accent rounded-full transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </>
        ) : status === "success" ? (
          <>
            <CheckCircle2 className="text-status-completed mb-3" size={34} />
            <p className="font-semibold text-ink">Upload complete</p>
            <p className="text-sm text-ink-soft mt-1 max-w-md">{message}</p>
            <p className="text-xs text-accent mt-3">Drop another file to re-process the dashboard</p>
          </>
        ) : status === "error" ? (
          <>
            <XCircle className="text-status-overdue mb-3" size={34} />
            <p className="font-semibold text-ink">Upload failed</p>
            <p className="text-sm text-ink-soft mt-1 max-w-md">{message}</p>
            {detail && <p className="text-xs text-ink-faint mt-2 max-w-md">{detail}</p>}
            <p className="text-xs text-accent mt-3">Try dropping the file again</p>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-3">
              <UploadCloud className="text-accent" size={26} />
            </div>
            <p className="font-semibold text-ink">
              {isDragActive ? "Drop the file here" : "Drag & drop your dataset, or click to browse"}
            </p>
            <p className="text-sm text-ink-soft mt-1">Excel, CSV, Word, PDF, TXT/TSV, JSON, or RTF</p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 mt-4 max-w-sm">
              <span className="flex items-center gap-1.5 text-xs text-ink-faint">
                <FileSpreadsheet size={15} /> .xlsx / .xls
              </span>
              <span className="flex items-center gap-1.5 text-xs text-ink-faint">
                <FileText size={15} /> .csv / .tsv / .txt
              </span>
              <span className="flex items-center gap-1.5 text-xs text-ink-faint">
                <FileType size={15} /> .docx
              </span>
              <span className="flex items-center gap-1.5 text-xs text-ink-faint">
                <FileText size={15} /> .pdf
              </span>
              <span className="flex items-center gap-1.5 text-xs text-ink-faint">
                <FileType size={15} /> .json / .rtf
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
