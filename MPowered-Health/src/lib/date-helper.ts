const TIME = {
    SECONDS_IN_MINUTES: 60,
    MINUTES_IN_HOUR: 60,
    HOURS_IN_DAY: 24,
    DAYS_IN_WEEK: 7,
    WEEKS_IN_YEAR: 52,
} as const;


export const formatTimeAgo = (createdAt: string): string => {
    const now = new Date();
    const created = new Date(createdAt);
    const diff = now.getTime() - created.getTime();

    const minutes = Math.floor(diff / (1000 * TIME.SECONDS_IN_MINUTES));
    const hours = Math.floor(diff / (1000 * TIME.SECONDS_IN_MINUTES * TIME.MINUTES_IN_HOUR));
    const days = Math.floor(hours / TIME.HOURS_IN_DAY);
    const weeks = Math.floor(days / TIME.DAYS_IN_WEEK);
    const years = Math.floor(weeks / TIME.WEEKS_IN_YEAR);

    if (minutes < 1) {
        return "Just now";
    } else if (minutes< 60) {
        return `${minutes}m ago`;
    } else if (hours < 24) {
        return `${hours}h ago`;
    } else if (days < 7) {
        return `${days}d ago`;
    } else if (weeks < 52) {
        return `${weeks}wk ago`; 
    } else {
        return `${years}yr ago`;
    }
};