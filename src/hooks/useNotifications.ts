export const useNotifications = () => {
    const scheduleDailyReminder = async () => {
        console.log("Notifications disabled on Personal Team builds due to Apple restrictions.");
    };

    return { scheduleDailyReminder };
};
