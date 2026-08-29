function calculateProjectProgress(startDate, expectedDate) {
  if (!startDate || !expectedDate) {
    return 0;
  }

  const start = new Date(startDate);
  const end = new Date(expectedDate);
  const now = new Date();
  const total = end.getTime() - start.getTime();

  if (Number.isNaN(total) || total <= 0) {
    return 0;
  }

  if (now <= start) {
    return 0;
  }

  if (now >= end) {
    return 100;
  }

  const elapsed = now.getTime() - start.getTime();
  return Number(((elapsed / total) * 100).toFixed(2));
}

function summarizeProjects(projects) {
  const now = new Date();

  return projects.reduce(
    (summary, project) => {
      const start = project.startDate ? new Date(project.startDate) : null;
      const end = project.expectedDate ? new Date(project.expectedDate) : null;

      if (start && end && now > start && now < end) {
        summary.ongoing += 1;
      }

      if (end && now > end) {
        summary.completed += 1;
      }

      return summary;
    },
    { ongoing: 0, completed: 0 }
  );
}

module.exports = {
  calculateProjectProgress,
  summarizeProjects,
};
