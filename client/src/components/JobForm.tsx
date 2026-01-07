import { useState } from "react";

export default function JobForm({ onSubmit, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title || !description || !skills) return alert("All fields required");
    onSubmit({ title, description, skills: skills.split(',').map(s => s.trim()) });
  };

  return (
    <div className="bg-white shadow-md p-6 rounded-xl max-w-xl mx-auto">
      <h3 className="text-xl font-semibold text-indigo-600 mb-4">Post a Job</h3>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Job Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border px-4 py-2 rounded-lg"
        />
        <textarea
          placeholder="Job Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full border px-4 py-2 rounded-lg"
        />
        <input
          type="text"
          placeholder="Skills (comma separated)"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="w-full border px-4 py-2 rounded-lg"
        />
        <div className="flex gap-4">
          <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
            Post
          </button>
          <button
            type="button"
            className="bg-gray-300 text-black px-4 py-2 rounded-lg"
            onClick={onCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
