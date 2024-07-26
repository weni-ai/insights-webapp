class Dashboard {
  constructor(
    uuid,
    name,
    grid = {
      columns: 0,
      rows: 0,
    },
    isDefault,
    is_editable = false,
    is_deletable = false,
  ) {
    this.uuid = uuid;
    this.name = name;
    this.grid = grid;
    this.is_default = isDefault;
    this.is_editable = is_editable;
    this.is_deletable = is_deletable;
  }
}

export default Dashboard;
