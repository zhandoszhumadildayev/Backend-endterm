function getPagination(query) {
  const page = Math.max(Number(query.page || 1), 1);
  const pageSize = Math.min(Math.max(Number(query.page_size || query.pageSize || 10), 1), 100);
  const skip = (page - 1) * pageSize;
  return { page, pageSize, skip, take: pageSize };
}

function pageResponse(items, total, page, pageSize) {
  return {
    items,
    total,
    page,
    page_size: pageSize,
    total_pages: Math.ceil(total / pageSize)
  };
}

module.exports = { getPagination, pageResponse };
