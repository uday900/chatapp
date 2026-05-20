
function ConfirmBox({ title, message, onConfirm, onCancel }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 py-6">
                  <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl">
                    <h2 className="text-lg font-semibold text-gray-900 mb-3">
                      {title}
                    </h2>
                    <p className="text-sm text-gray-600 mb-6">
                      {message}
                    </p>
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={onCancel}
                        className="px-4 py-2 rounded-full border border-gray-300 text-gray-700 hover:bg-gray-100"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-full bg-black text-white hover:bg-gray-800"
                      >
                        Proceed
                      </button>
                    </div>
                  </div>
                </div>
    )
};

export default ConfirmBox;