export default function getNecessariesPages(total: number, limit: number) {
    const pages = Math.ceil(total / limit);
    return pages;
};