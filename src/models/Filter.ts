import { FilterType, FilterSource } from './types/FilterTypes';

type FilterParams = {
  type: FilterType;
  source?: FilterSource;
  depends_on?: {
    filter: string;
    search_param: string | null;
  };
};

class Filter {
  type: FilterType;
  source?: FilterSource;
  depends_on?: {
    filter: string;
    search_param: string | null;
  };

  constructor(params: FilterParams) {
    this.type = params.type;
    this.source = params.source;
    this.depends_on = params.depends_on;
  }
}

export default Filter;
