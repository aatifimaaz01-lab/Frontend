export default function AttendanceModal({ open, onCheckIn, onClose }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl p-8 text-center w-96">
        <h2 className="text-xl font-semibold mb-6">Start your work day</h2>

        <button
          onClick={onCheckIn}
          className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700"
        >
          Check In
        </button>
      </div>
    </div>
  );
}
