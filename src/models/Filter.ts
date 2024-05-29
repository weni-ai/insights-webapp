import { FilterType, FilterSource } from './types/FilterTypes';

type FilterParams = {
  name: string;
  label: string;
  placeholder: string;
  type: FilterType;
  source?: FilterSource;
  depends_on?: {
    filter: string;
    search_param: string | null;
  };
};

class Filter {
  name: string;
  label: string;
  placeholder: string;
  type: FilterType;
  source?: FilterSource;
  depends_on?: {
    filter: string;
    search_param: string | null;
  };

  constructor(params: FilterParams) {
    this.name = params.name;
    this.label = params.label;
    this.placeholder = params.placeholder;
    this.type = params.type;
    this.source = params.source;
    this.depends_on = params.depends_on;
  }
}

export default Filter;
