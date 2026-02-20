import { toast } from "sonner";
import { Task } from "./types";

export const checkPendingTasks = (tasks: Task[]) => {
    const pendingTasks = tasks.filter(t => t.status === 'active' && t.sessionHistory.length === 0);

    if (pendingTasks.length > 0) {
        const task = pendingTasks[0];
        toast("Pending Task Reminder", {
            description: `You have a pending task: "${task.title}". Want to start now?`,
            action: {
                label: "Start",
                onClick: () => console.log("Start task", task.id),
            },
        });
    }
};

export const requestNotificationPermission = async () => {
    if ("Notification" in window) {
        const permission = await Notification.requestPermission();
        return permission === "granted";
    }
    return false;
};

export const sendBrowserNotification = (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
        new Notification(title, { body });
    }
};
