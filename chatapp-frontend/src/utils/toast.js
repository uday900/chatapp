import toast from "react-hot-toast";

export const showSuccess = (msg) => {
  toast.success(msg, {
    style: { background: "#16a34a", color: "#fff" }, // green
  });
};

export const showError = (msg) => {
  toast.error(msg, {
    style: { background: "#dc2626", color: "#fff" }, // red
  });
};

export const showInfo = (msg) => {
  toast(msg, {
    style: { background: "#2563eb", color: "#fff" }, // blue
  });
};
