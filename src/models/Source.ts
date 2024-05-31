type SourceParams = {
  name: string;
  uuid: string;
};

class Source {
  name: string;
  uuid: string;

  constructor(params: SourceParams) {
    this.name = params.name;
    this.uuid = params.uuid;
  }
}

export default Source;
