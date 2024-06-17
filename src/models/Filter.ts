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
  start_sufix?: string;
  end_sufix?: string;
  key_value_field?: string;
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
  start_sufix?: string;
  end_sufix?: string;
  key_value_field?: string;

  constructor(params: FilterParams) {
    this.name = params.name;
    this.label = params.label;
    this.placeholder = params.placeholder;
    this.type = params.type;
    this.source = params.source;
    this.depends_on = params.depends_on;
    this.start_sufix = params.start_sufix;
    this.end_sufix = params.end_sufix;
    this.key_value_field = params.key_value_field;
  }
}

export default Filter;
