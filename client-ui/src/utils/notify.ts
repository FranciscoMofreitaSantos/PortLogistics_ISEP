import toast from "react-hot-toast";

export const notifySuccess = (msg: string) =>
    toast.success(msg, { id: "success-global" });

export const notifyError = (msg: string) =>
    toast.error(msg, { id: "error-global" });

export const notifyInfo = (msg: string) =>
    toast(msg, { id: "info-global" });

export const notifyLoading = (msg: string) =>
    toast.loading(msg, { id: "loading-global" });

// Para promessas longas (criar, update, delete API)
export const notifyPromise = <T>(promise: Promise<T>, msgs: {
    loading: string;
    success: string;
    error: string;
}) => toast.promise(promise, msgs);
