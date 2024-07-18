export function isFilteringDates({ appliedFilters, currentDashboardFilters }) {
  const currentDashboardDateFiltersNames = currentDashboardFilters
    .filter((filter) => filter.type === 'date_range')
    .map((filter) => filter.name);

  const appliedFilterNames = Object.keys(appliedFilters);

  return !!currentDashboardDateFiltersNames.some(
    (currentDashboardDateFilterName) =>
      appliedFilterNames.some((appliedFilterName) =>
        currentDashboardDateFilterName.includes(appliedFilterName),
      ),
  );
}
