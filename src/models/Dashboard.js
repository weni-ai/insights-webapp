class Dashboard {
  constructor(
    uuid,
    name,
    grid = {
      columns: 0,
      rows: 0,
    },
    isDefault,
  ) {
    this.uuid = uuid;
    this.name = name;
    this.grid = grid;
    this.is_default = isDefault;
  }
}

export default Dashboard;
