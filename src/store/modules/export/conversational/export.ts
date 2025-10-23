import exportApi, {
  ExportRequest,
  ExportResponse,
  TypeSections,
} from '@/services/api/resources/export/conversational/export';
import i18n from '@/utils/plugins/i18n';
import { defaultAlert } from '@/utils/topics';
import { defineStore } from 'pinia';
import { WidgetType } from '@/models/types/WidgetTypes';

interface SelectedFields {
  [modelName: string]: string[];
}

interface DateRange {
  start: string;
  end: string;
}

interface SectionField {
  type?: string;
  hasSubOptions?: boolean;
  subOptions?: string[];
  uuid?: string;
}

interface ConversationalModelFields {
  [sectionName: string]: {
    [fieldName: string]: SectionField;
  };
}

interface ExportData {
  isRenderExportData: boolean;
  isRenderExportDataFeedback: boolean;
  date_range: DateRange;
  type: 'CSV' | 'XLSX';
  export_data: ExportResponse;
  accept_terms: boolean;
  model_fields: ConversationalModelFields;
  selected_fields: SelectedFields;
  enabled_models: string[];
  sections: TypeSections[];
  custom_widgets: WidgetType[];
  isLoadingCreateExport: boolean;
  isLoadingCheckExportStatus: boolean;
}

export const useConversationalExport = defineStore('conversationalExport', {
  state: (): ExportData => ({
    isRenderExportData: false,
    isRenderExportDataFeedback: false,
    date_range: {} as DateRange,
    type: 'XLSX',
    export_data: {} as ExportResponse,
    accept_terms: false,
    model_fields: {},
    selected_fields: {},
    enabled_models: [],
    sections: [],
    custom_widgets: [],
    isLoadingCreateExport: false,
    isLoadingCheckExportStatus: false,
  }),

  actions: {
    setIsRenderExportData(isRenderExportData: boolean) {
      this.isRenderExportData = isRenderExportData;
    },
    setIsRenderExportDataFeedback(isRenderExportDataFeedback: boolean) {
      this.isRenderExportDataFeedback = isRenderExportDataFeedback;
    },
    setDateRange(start_date: string, end_date: string) {
      this.date_range.start = start_date;
      this.date_range.end = end_date;
    },
    setType(type: 'CSV' | 'XLSX') {
      this.type = type;
    },
    setExportData(export_data: ExportResponse) {
      this.export_data = export_data;
    },
    setAcceptTerms(accept_terms: boolean) {
      this.accept_terms = accept_terms;
    },
    setModelFields(modelFields: ConversationalModelFields) {
      this.model_fields = modelFields;
    },
    addCustomWidgets(widgets: WidgetType[]) {
      if (Object.keys(this.model_fields).length > 5) return;

      this.custom_widgets = widgets;

      const customWidgetsFields = widgets.reduce((acc, widget) => {
        acc[widget.uuid] = {};
        return acc;
      }, {} as ConversationalModelFields);

      this.model_fields = { ...this.model_fields, ...customWidgetsFields };
    },
    setSelectedFields(selectedFields: SelectedFields) {
      this.selected_fields = selectedFields;
    },
    updateModelFieldSelection(
      modelName: string,
      fieldName: string,
      selected: boolean,
    ) {
      if (!this.selected_fields[modelName]) {
        this.selected_fields[modelName] = [];
      }

      if (selected) {
        if (!this.selected_fields[modelName].includes(fieldName)) {
          this.selected_fields[modelName].push(fieldName);
        }
      } else {
        this.selected_fields[modelName] = this.selected_fields[
          modelName
        ].filter((field) => field !== fieldName);
      }
    },
    toggleModelEnabled(modelName: string, enabled: boolean) {
      if (enabled) {
        if (!this.enabled_models.includes(modelName)) {
          this.enabled_models.push(modelName);
        }

        if (this.model_fields[modelName]) {
          const allFields = Object.keys(this.model_fields[modelName]);
          this.selected_fields[modelName] = [...allFields];
        }
      } else {
        this.enabled_models = this.enabled_models.filter(
          (model) => model !== modelName,
        );

        this.selected_fields[modelName] = [];
      }
    },
    setSections(sections: TypeSections[]) {
      this.sections = sections;
    },
    setCustomWidgets(customWidgets: string[]) {
      this.custom_widgets = customWidgets;
    },
    async initializeDefaultFields() {
      const availableWidgets = await exportApi.getAvailableWidgets();

      const defaultFields: ConversationalModelFields = {};

      const sectionsMap: Record<
        string,
        { model: string; subsection?: string }
      > = {
        RESOLUTIONS: { model: 'resolutions' },
        TRANSFERRED: { model: 'transferred' },
        TOPICS_AI: { model: 'topics', subsection: 'ai' },
        TOPICS_HUMAN: { model: 'topics', subsection: 'human' },
        CSAT_AI: { model: 'csat', subsection: 'ai' },
        CSAT_HUMAN: { model: 'csat', subsection: 'human' },
        NPS_AI: { model: 'nps', subsection: 'ai' },
        NPS_HUMAN: { model: 'nps', subsection: 'human' },
      };

      availableWidgets.sections.forEach((section) => {
        const mapping = sectionsMap[section];
        if (!mapping) return;

        const { model, subsection } = mapping;

        if (!defaultFields[model]) {
          defaultFields[model] = {};
        }

        if (subsection) {
          defaultFields[model][subsection] = { type: 'subsection' };
        }
      });

      const filteredModelFields: ConversationalModelFields = {};

      Object.keys(this.model_fields).forEach((uuid) => {
        if (
          defaultFields[uuid] ||
          availableWidgets.custom_widgets.includes(uuid)
        ) {
          filteredModelFields[uuid] = this.model_fields[uuid];
        }
      });

      this.setModelFields({ ...defaultFields, ...filteredModelFields });
    },
    async createExport() {
      this.isLoadingCreateExport = true;
      try {
        const selectedSections: TypeSections[] = [];
        const selectedCustomWidgets: string[] = [];

        const modelToSectionMap: Record<
          string,
          string | Record<string, string>
        > = {
          resolutions: 'RESOLUTIONS',
          transferred: 'TRANSFERRED',
          topics: { human: 'TOPICS_HUMAN', ai: 'TOPICS_AI' },
          csat: { human: 'CSAT_HUMAN', ai: 'CSAT_AI' },
          nps: { human: 'NPS_HUMAN', ai: 'NPS_AI' },
        };

        for (const model of this.enabled_models) {
          const sectionMapping = modelToSectionMap[model];

          if (!sectionMapping) continue;

          if (typeof sectionMapping === 'string') {
            selectedSections.push(sectionMapping as TypeSections);
          } else {
            const modelFields = this.selected_fields[model] || [];
            for (const field of modelFields) {
              if (sectionMapping[field]) {
                selectedSections.push(sectionMapping[field] as TypeSections);
              }
            }
          }
        }

        for (const widget of this.custom_widgets) {
          if (this.enabled_models.includes(widget.uuid)) {
            selectedCustomWidgets.push(widget.uuid);
          }
        }

        const exportData: Omit<ExportRequest, 'project_uuid'> = {
          start_date: this.date_range.start,
          end_date: this.date_range.end,
          type: this.type,
          sections: selectedSections,
          custom_widgets: selectedCustomWidgets,
        };

        const response = await exportApi.createExport(exportData);

        this.export_data = response;

        this.setIsRenderExportData(false);
        this.setIsRenderExportDataFeedback(true);
      } catch (error) {
        if (error?.status === 400 && error?.data?.concurrent_report) {
          defaultAlert(
            'error',
            i18n.global.t('export_data.error_pending_export'),
          );
        } else if (error?.status === 400 && error?.data?.error) {
          defaultAlert('error', error?.data?.error);
        } else {
          defaultAlert('error', i18n.global.t('export_data.error_default'));
        }
        console.error('Error creating conversational export', error);
      } finally {
        this.isLoadingCreateExport = false;
      }
    },
    async checkExportStatus() {
      this.isLoadingCheckExportStatus = true;
      try {
        const response = await exportApi.checkExportStatus();
        this.export_data = response;
      } catch (error) {
        console.error('Error checking conversational export status', error);
      } finally {
        this.isLoadingCheckExportStatus = false;
      }
    },
  },
  getters: {
    hasEnabledToExport: (state) => {
      const isDateRange = state.date_range.start && state.date_range.end;
      const isType = state.type;
      const isEnabledModels = state.enabled_models.length > 0;

      let hasValidSelections = false;

      if (
        state.enabled_models.includes('resolutions') ||
        state.enabled_models.includes('transferred')
      ) {
        hasValidSelections = true;
      }

      [
        'topics',
        'csat',
        'nps',
        ...state.custom_widgets.map((widget) => widget.uuid),
      ].forEach((section) => {
        if (state.enabled_models.includes(section)) {
          const sectionFields = state.selected_fields[section] || [];
          if (sectionFields.length > 0) {
            hasValidSelections = true;
          }

          if (state.custom_widgets.some((widget) => widget.uuid === section)) {
            hasValidSelections = true;
          }
        }
      });

      return (
        isDateRange &&
        isType &&
        isEnabledModels &&
        hasValidSelections &&
        state.accept_terms
      );
    },
  },
});
