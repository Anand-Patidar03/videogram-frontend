export const formatTimeAgo = (dateString) => {
    if (!dateString) return "Unknown date";

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Unknown date";

    const now = new Date();
    const secondsPast = (now.getTime() - date.getTime()) / 1000;

    if (secondsPast < 60) {
        return 'Just now';
    }
    if (secondsPast < 3600) {
        const m = Math.floor(secondsPast / 60);
        return `${m} minute${m === 1 ? '' : 's'} ago`;
    }
    if (secondsPast <= 86400) {
        const h = Math.floor(secondsPast / 3600);
        return `${h} hour${h === 1 ? '' : 's'} ago`;
    }
    if (secondsPast <= 604800) {
        const d = Math.floor(secondsPast / 86400);
        return `${d} day${d === 1 ? '' : 's'} ago`;
    }


    return date.toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};
