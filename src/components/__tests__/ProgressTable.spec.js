import { beforeEach, describe, expect, it } from 'vitest';
import { config, shallowMount } from '@vue/test-utils';

import ProgressTable from '@/components/ProgressTable.vue';
import ProgressItem from '@/components/ProgressTableRow.vue';
import { createI18n } from 'vue-i18n';
import { nextTick } from 'vue';

config.global.plugins = [
  createI18n({
    legacy: false,
  }),
];

const mockProgressItems = [
  {
    label: 'Task 1',
    value: 75,
    description: 'First task description',
    backgroundColor: '#e3f2fd',
    color: '#2196f3',
  },
  {
    label: 'Task 2',
    value: 50,
    description: 'Second task description',
    backgroundColor: '#f3e5f5',
    color: '#9c27b0',
    isExpandable: true,
    expandableDescription: 'Click to expand',
    subItems: [
      {
        label: 'Subtask 1',
        value: 30,
        description: 'First subtask',
        backgroundColor: '#fff3e0',
        color: '#ff9800',
      },
      {
        label: 'Subtask 2',
        value: 70,
        description: 'Second subtask',
        backgroundColor: '#e8f5e8',
        color: '#4caf50',
      },
    ],
  },
  {
    label: 'Task 3',
    value: 100,
    description: 'Third task description',
    isExpandable: true,
    expandableDescription: 'Has 3 items',
    subItems: [
      {
        label: 'Subtask A',
        value: 90,
        description: 'Subtask A description',
      },
      {
        label: 'Subtask B',
        value: 80,
        description: 'Subtask B description',
      },
      {
        label: 'Subtask C',
        value: 95,
        description: 'Subtask C description',
      },
    ],
  },
];

const createWrapper = (props = {}) => {
  return shallowMount(ProgressTable, {
    props: {
      progressItems: mockProgressItems,
      ...props,
    },
  });
};

describe('ProgressTable', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = createWrapper();
  });

  const progressTable = () => wrapper.find('[data-testid="progress-table"]');
  const progressTableBody = () =>
    wrapper.find('[data-testid="progress-table-body"]');
  const progressTableItems = () =>
    wrapper.findAllComponents('[data-testid="progress-table-item"]');

  describe('Component Structure', () => {
    it('should render the table structure correctly', () => {
      expect(progressTable().exists()).toBe(true);
      expect(progressTableBody().exists()).toBe(true);
      expect(wrapper.element.tagName).toBe('TABLE');
    });

    it('should render ProgressItem components for each progress item', () => {
      expect(progressTableItems()).toHaveLength(mockProgressItems.length);
    });

    it('should match snapshot', () => {
      expect(wrapper.element).toMatchSnapshot();
    });
  });

  describe('Props Handling', () => {
    it('should pass correct props to ProgressItem components', () => {
      progressTableItems().forEach((item, index) => {
        const expectedItem = mockProgressItems[index];
        const props = item.props();

        expect(props.label).toBe(expectedItem.label);
        expect(props.value).toBe(expectedItem.value);
        expect(props.description).toBe(expectedItem.description);
        expect(props.backgroundColor).toBe(expectedItem.backgroundColor);
        expect(props.color).toBe(expectedItem.color);
        expect(props.isExpandable).toBe(!!expectedItem.subItems);
        expect(props.subItems).toEqual(expectedItem.subItems || undefined);
      });
    });

    it('should handle subItemsDescription prop correctly', async () => {
      const testDescription = 'test items';
      await wrapper.setProps({ subItemsDescription: testDescription });

      const expandableItems = wrapper
        .findAllComponents(ProgressItem)
        .filter((item) => item.props().isExpandable);

      expandableItems.forEach((item) => {
        expect(item.props().expandableDescription).toContain(testDescription);
      });
    });

    it('should handle expandedItems prop correctly', () => {
      const expandedItems = ['Task 2', 'Task 3'];
      wrapper = createWrapper({ expandedItems });

      progressTableItems().forEach((item) => {
        const isExpanded = expandedItems.includes(item.props().label);
        expect(item.props().expanded).toBe(isExpanded);
      });
    });

    it('should handle empty progressItems array', async () => {
      await wrapper.setProps({ progressItems: [] });

      expect(progressTableItems()).toHaveLength(0);
    });
  });

  describe('Expandable Description Generation', () => {
    it('should generate expandable description with subItems count', () => {
      expect(progressTableItems()[1].props().expandableDescription).toBe('2 ');
      expect(progressTableItems()[2].props().expandableDescription).toBe('3 ');
    });

    it('should include subItemsDescription in expandable description', async () => {
      const subItemsDescription = 'subtasks available';
      await wrapper.setProps({ subItemsDescription });

      expect(progressTableItems()[1].props().expandableDescription).toBe(
        `2 ${subItemsDescription}`,
      );
      expect(progressTableItems()[2].props().expandableDescription).toBe(
        `3 ${subItemsDescription}`,
      );
    });
  });

  describe('Expand/Collapse Functionality', () => {
    it('should handle expand event correctly', async () => {
      expect(wrapper.vm.expandedItems).toEqual([]);

      await progressTableItems()[1].vm.$emit('expand', true);

      expect(wrapper.vm.expandedItems).toEqual(['Task 2']);
      expect(progressTableItems()[1].props().expanded).toBe(true);
    });

    it('should handle collapse event correctly', async () => {
      wrapper.vm.expandedItems = ['Task 2', 'Task 3'];

      await nextTick();

      await progressTableItems()[1].vm.$emit('expand', false);
      await nextTick();

      expect(wrapper.vm.expandedItems).not.toContain('Task 2');
      expect(wrapper.vm.expandedItems).toContain('Task 3');
      expect(progressTableItems()[1].props().expanded).toBe(false);
    });

    it('should handle multiple expand/collapse operations', async () => {
      await progressTableItems()[1].vm.$emit('expand', true);
      await progressTableItems()[2].vm.$emit('expand', true);

      expect(wrapper.vm.expandedItems).toEqual(['Task 2', 'Task 3']);

      await progressTableItems()[1].vm.$emit('expand', false);

      expect(wrapper.vm.expandedItems).toEqual(['Task 3']);

      await progressTableItems()[2].vm.$emit('expand', false);

      expect(wrapper.vm.expandedItems).toEqual([]);
    });
  });

  describe('Integration with ProgressItem', () => {
    it('should render the correct number of ProgressItem components', () => {
      expect(progressTableItems()).toHaveLength(mockProgressItems.length);
    });

    it('should correctly identify expandable items', () => {
      expect(progressTableItems()[0].props().isExpandable).toBe(false);

      expect(progressTableItems()[1].props().isExpandable).toBe(true);
      expect(progressTableItems()[2].props().isExpandable).toBe(true);
    });

    it('should handle items without optional properties gracefully', async () => {
      const minimalItems = [
        {
          label: 'Minimal Task',
          value: 50,
          description: 'Basic task',
        },
      ];

      await wrapper.setProps({ progressItems: minimalItems });

      expect(progressTableItems()[0].props().backgroundColor).toBeUndefined();
      expect(progressTableItems()[0].props().color).toBeUndefined();
      expect(progressTableItems()[0].props().isExpandable).toBe(false);
      expect(progressTableItems()[0].props().subItems).toBeUndefined();
    });
  });

  describe('Loading State', () => {
    it('should show skeleton loading when isLoading is true', () => {
      wrapper = createWrapper({ isLoading: true });

      const skeletonElements = wrapper.findAll(
        '[data-testid="progress-table-skeleton"]',
      );
      const progressTable = wrapper.find('[data-testid="progress-table"]');

      expect(skeletonElements).toHaveLength(5);
      expect(progressTable.exists()).toBe(false);
    });

    it('should render correct number of skeleton loading elements', () => {
      wrapper = createWrapper({ isLoading: true });

      const skeletonElements = wrapper.findAll(
        '[data-testid="progress-table-skeleton"]',
      );
      expect(skeletonElements).toHaveLength(5);
    });

    it('should apply correct props to skeleton loading elements', () => {
      wrapper = createWrapper({ isLoading: true });

      const skeletonElements = wrapper.findAll(
        '[data-testid="progress-table-skeleton"]',
      );

      skeletonElements.forEach((skeleton) => {
        expect(skeleton.attributes('width')).toBe('100%');
        expect(skeleton.attributes('height')).toBe('51.5px');
      });
    });

    it('should show loading section with correct class when isLoading is true', () => {
      wrapper = createWrapper({ isLoading: true });

      const loadingSection = wrapper.find('.progress-table__loading');
      expect(loadingSection.exists()).toBe(true);
      expect(loadingSection.element.tagName).toBe('SECTION');
    });

    it('should hide table when isLoading is true', () => {
      wrapper = createWrapper({ isLoading: true });

      const progressTable = wrapper.find('[data-testid="progress-table"]');
      const progressTableBody = wrapper.find(
        '[data-testid="progress-table-body"]',
      );
      const progressTableItems = wrapper.findAllComponents(
        '[data-testid="progress-table-item"]',
      );

      expect(progressTable.exists()).toBe(false);
      expect(progressTableBody.exists()).toBe(false);
      expect(progressTableItems).toHaveLength(0);
    });

    it('should show table and hide loading when isLoading is false', () => {
      wrapper = createWrapper({ isLoading: false });

      const skeletonElements = wrapper.findAll(
        '[data-testid="progress-table-skeleton"]',
      );
      const loadingSection = wrapper.find('.progress-table__loading');
      const progressTable = wrapper.find('[data-testid="progress-table"]');

      expect(skeletonElements).toHaveLength(0);
      expect(loadingSection.exists()).toBe(false);
      expect(progressTable.exists()).toBe(true);
    });

    it('should show table by default when isLoading prop is not provided', () => {
      wrapper = createWrapper();

      const skeletonElements = wrapper.findAll(
        '[data-testid="progress-table-skeleton"]',
      );
      const loadingSection = wrapper.find('.progress-table__loading');
      const progressTable = wrapper.find('[data-testid="progress-table"]');

      expect(skeletonElements).toHaveLength(0);
      expect(loadingSection.exists()).toBe(false);
      expect(progressTable.exists()).toBe(true);
    });

    it('should toggle between loading and table states correctly', async () => {
      wrapper = createWrapper({ isLoading: true });

      expect(
        wrapper.findAll('[data-testid="progress-table-skeleton"]'),
      ).toHaveLength(5);
      expect(wrapper.find('[data-testid="progress-table"]').exists()).toBe(
        false,
      );

      await wrapper.setProps({ isLoading: false });

      expect(
        wrapper.findAll('[data-testid="progress-table-skeleton"]'),
      ).toHaveLength(0);
      expect(wrapper.find('[data-testid="progress-table"]').exists()).toBe(
        true,
      );

      await wrapper.setProps({ isLoading: true });

      expect(
        wrapper.findAll('[data-testid="progress-table-skeleton"]'),
      ).toHaveLength(5);
      expect(wrapper.find('[data-testid="progress-table"]').exists()).toBe(
        false,
      );
    });
  });
});
