import { describe, it, expect, beforeEach, vi } from 'vitest';
import { nextTick } from 'vue';
import { shallowMount, config } from '@vue/test-utils';
import { setActivePinia, createPinia } from 'pinia';
import Conversational from '../Conversational.vue';
import { createI18n } from 'vue-i18n';

config.global.plugins = [
  createI18n({
    legacy: false,
  }),
];

describe('Conversational', () => {
  let wrapper;

  beforeEach(() => {
    setActivePinia(createPinia());
    wrapper = shallowMount(Conversational, {
      global: {
        stubs: {
          DashboardHeader: true,
          MostTalkedAboutTopicsWidget: true,
          ConversationalDynamicWidget: true,
        },
      },
    });
  });

  describe('orderedDynamicWidgets computed property', () => {
    const testScenarios = [
      {
        description:
          'returns csat and add when dynamicWidgets contains only csat',
        input: ['csat'],
        expected: ['csat', 'add'],
      },
      {
        description:
          'returns nps and add when dynamicWidgets contains only nps',
        input: ['nps'],
        expected: ['nps', 'add'],
      },
      {
        description:
          'returns csat and nps when dynamicWidgets contains both csat and nps',
        input: ['csat', 'nps'],
        expected: ['csat', 'nps'],
      },
      {
        description: 'returns only add when dynamicWidgets is empty',
        input: [],
        expected: ['add'],
      },
      {
        description:
          'maintains csat first, then nps order when both are present',
        input: ['nps', 'csat'],
        expected: ['csat', 'nps'],
      },
    ];

    testScenarios.forEach(({ description, input, expected }) => {
      it(description, async () => {
        wrapper.vm.dynamicWidgets = input;
        await nextTick();

        expect(wrapper.vm.orderedDynamicWidgets).toEqual(expected);
      });
    });
  });
});
