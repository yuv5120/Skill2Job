export default function JobCard({ job }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h3 className="text-lg font-semibold text-indigo-700">{job.title}</h3>
      <p className="text-gray-600 my-2">{job.description}</p>
      <div className="flex flex-wrap gap-2 mt-2">
        {job.skills.map((skill, i) => (
          <span key={i} className="text-sm bg-indigo-100 text-indigo-700 px-2 py-1 rounded-md">
            {skill}
          </span>
        ))}
      </div>
    </div>
  );
}
