export function json(o: unknown) {
    return JSON.stringify(o);
}

export function copyToClipboard(id: string): boolean {
    const range = document.createRange();
    const key = document.getElementById (id);
    if (key) {
        range.selectNode(key);
        const selection = window.getSelection();
        if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
            document.execCommand('copy');
            selection.removeAllRanges();
        } else {
            return false;
        }
    } else {
        return false;
    }
    return true;
}

export function toTime(date: number): string {
    return new Date(date).toLocaleTimeString();
}

