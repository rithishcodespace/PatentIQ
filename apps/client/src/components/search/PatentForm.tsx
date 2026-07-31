import { useState } from "react";

interface PatentFormProps {
  onSearch: (data: {
    title: string;
    abstract: string;
    claims: string;
  }) => void;
}

const PatentForm = ({ onSearch }: PatentFormProps) => {
  const [title, setTitle] = useState("");
  const [abstract, setAbstract] = useState("");
  const [claims, setClaims] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSearch({
      title,
      abstract,
      claims,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-lg rounded-2xl p-8 space-y-6"
    >
      <div>
        <label className="block mb-2 font-semibold text-gray-700">
          Patent Title
        </label>

        <input
          type="text"
          placeholder="Enter patent title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block mb-2 font-semibold text-gray-700">
          Abstract
        </label>

        <textarea
          rows={5}
          placeholder="Enter patent abstract..."
          value={abstract}
          onChange={(e) => setAbstract(e.target.value)}
          className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div>
        <label className="block mb-2 font-semibold text-gray-700">
          Claims
        </label>

        <textarea
          rows={6}
          placeholder="Enter patent claims..."
          value={claims}
          onChange={(e) => setClaims(e.target.value)}
          className="w-full border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
      >
        Search Patents
      </button>
    </form>
  );
};

export default PatentForm;