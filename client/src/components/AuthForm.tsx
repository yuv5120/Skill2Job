export default function AuthForm({ email, setEmail, password, setPassword, handleSubmit, buttonText }) {
  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md space-y-6">
      <h2 className="text-2xl font-bold text-center text-indigo-600">{buttonText}</h2>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        className="w-full border border-gray-300 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
        required
      />
      <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-xl hover:bg-indigo-700 transition">
        {buttonText}
      </button>
    </form>
  );
}
