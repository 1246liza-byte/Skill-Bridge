export function formatDate(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function formatDateTime(dateStr) {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    return d.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export function formatCurrency(amount) {
    if (amount === null || amount === undefined) return 'N/A';
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
    }).format(amount);
}

export function timeAgo(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 30) return `${days}d ago`;
    return formatDate(dateStr);
}

export function getInitials(name) {
    if (!name) return '?';
    return name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

// Safely extract an array from an axios response.
// Backend returns { success, data: [...] } (sometimes with pagination),
// so the list lives at res.data.data. Also tolerates a bare array.
export function toArray(res) {
    const body = res && res.data;
    if (Array.isArray(body)) return body;
    if (body && Array.isArray(body.data)) return body.data;
    return [];
}

// Safely turn a skill entry into displayable text.
// Skills can arrive as: a plain string, a populated object { _id, name },
// or an embedded subdocument { _id, proficiency } that has NO name.
// Never return an object here, or React will throw
// "Objects are not valid as a React child".
export function skillLabel(skill) {
    if (skill == null) return '';
    if (typeof skill === 'string') return skill;
    if (typeof skill === 'number') return String(skill);
    if (typeof skill === 'object') {
        if (typeof skill.name === 'string' && skill.name) return skill.name;
        if (typeof skill.title === 'string' && skill.title) return skill.title;
        if (typeof skill.label === 'string' && skill.label) return skill.label;
        return '';
    }
    return String(skill);
}

export function getErrorMessage(err, fallback = 'Something went wrong') {
    if (err && err.response && err.response.data && err.response.data.message) {
        return err.response.data.message;
    }
    if (err && err.message) {
        return err.message;
    }
    return fallback;
}