function startOfDay(date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

function getProjectStatus(expectedDate) {
  if (!expectedDate) return "Date not set";
  return startOfDay(expectedDate) <= startOfDay(new Date()) ? "Completed" : "In progress";
}

function serializeProject(project) {
  const result = project.toObject ? project.toObject() : project;
  return { ...result, status: getProjectStatus(result.expectedDate) };
}

module.exports = { getProjectStatus, serializeProject };
