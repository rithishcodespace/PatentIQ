import { useRef, useState, type DragEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText, CheckCircle2, X, AlertCircle } from "lucide-react";

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface UploadPdfFieldProps {
  file: File | null;
  onChange: (file: File | null) => void;
}

function formatFileSize(bytes: number) {
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

const UploadPdfField = ({ file, onChange }: UploadPdfFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateAndSet = (candidate: File | undefined) => {
    if (!candidate) return;

    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ];
    const isAllowedExt = candidate.name.endsWith(".pdf") || candidate.name.endsWith(".docx") || candidate.name.endsWith(".txt");

    if (!allowedTypes.includes(candidate.type) && !isAllowedExt) {
      setError("Supported file types: PDF, DOCX, or TXT documents.");
      return;
    }
    if (candidate.size > MAX_FILE_SIZE_BYTES) {
      setError(`File is too large — max size is ${MAX_FILE_SIZE_MB} MB.`);
      return;
    }

    setError(null);
    onChange(candidate);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    validateAndSet(e.dataTransfer.files[0]);
  };

  return (
    <div>
      <label className="mb-1.5 flex items-baseline gap-1.5 font-body text-xs font-semibold uppercase tracking-wide text-ink">
        <span className="font-mono text-amber">01</span>
        Patent document
      </label>

      <AnimatePresence mode="wait">
        {file ? (
          <motion.div
            key="uploaded"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-4 rounded-xl border border-emerald/30 bg-emerald/5 p-4"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald/15">
              <FileText size={20} className="text-emerald" strokeWidth={2} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="truncate font-body text-sm font-medium text-ink">
                {file.name}
              </p>
              <p className="mt-0.5 flex items-center gap-1.5 font-mono text-xs text-emerald-700">
                <CheckCircle2 size={12} strokeWidth={2.5} />
                Uploaded · {formatFileSize(file.size)}
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onChange(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              aria-label="Remove file"
              className="shrink-0 rounded-full p-1.5 text-slate transition hover:bg-white hover:text-rose-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo/40"
            >
              <X size={16} />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.25 }}
          >
            <motion.div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              whileHover={{ scale: 1.005 }}
              animate={{
                borderColor: isDragging ? "#1E2A78" : "#EEF0F4",
                backgroundColor: isDragging
                  ? "rgba(30,42,120,0.04)"
                  : "rgba(30,42,120,0.015)",
              }}
              transition={{ duration: 0.15 }}
              role="button"
              tabIndex={0}
              aria-label="Upload PDF file"
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  inputRef.current?.click();
                }
              }}
              className="flex min-h-[10rem] cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo/40 sm:min-h-[12rem]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo/8">
                <UploadCloud size={20} className="text-indigo" strokeWidth={2} />
              </div>

              <div>
                <p className="font-body text-sm font-medium text-ink">
                  Drag & drop your PDF here
                </p>
                <p className="mt-1 font-body text-xs text-slate">
                  or{" "}
                  <span className="font-medium text-indigo underline-offset-2 hover:underline">
                    browse files
                  </span>
                </p>
              </div>

              <p className="font-mono text-[11px] text-slate/70">
                PDF, DOCX, TXT · MAX {MAX_FILE_SIZE_MB} MB
              </p>

              <input
                ref={inputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="sr-only"
                onChange={(e) => validateAndSet(e.target.files?.[0])}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="mt-2 flex items-center gap-1.5 font-body text-xs text-rose-600">
          <AlertCircle size={13} />
          {error}
        </p>
      )}

      <p className="mt-2.5 font-body text-xs text-slate">
        Upload your invention draft, technical document, or patent draft in
        PDF format.
      </p>
    </div>
  );
};

export default UploadPdfField;
