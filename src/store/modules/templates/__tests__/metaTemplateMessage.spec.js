import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useMetaTemplateMessage } from '../metaTemplateMessage';
import MetaTemplateMessage from '@/services/api/resources/template/metaTemplateMessage';

vi.mock('@/services/api/resources/template/metaTemplateMessage');

describe('MetaTemplateMessage Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  describe('State', () => {
    it('should initialize with default state values', () => {
      const store = useMetaTemplateMessage();

      expect(store.showSearchTemplateMetaModal).toBe(false);
      expect(store.favoritesTemplates).toEqual([]);
      expect(store.selectedFavoriteTemplate).toEqual([{ value: '' }]);
      expect(store.selectedTemplateUuid).toBe('');
      expect(store.isLoadingFavoritesTemplates).toBe(false);
      expect(store.emptyTemplates).toBe(false);
    });
  });

  describe('Actions', () => {
    describe('getFavoritesTemplates', () => {
      it('should fetch and update favorites templates', async () => {
        const mockResponse = [{ id: 1, name: 'Template 1' }];
        vi.mocked(MetaTemplateMessage.getFavoritesTemplates).mockResolvedValue(
          mockResponse,
        );

        const store = useMetaTemplateMessage();
        await store.getFavoritesTemplates('dashboard');

        expect(MetaTemplateMessage.getFavoritesTemplates).toHaveBeenCalledWith({
          dashboard: 'dashboard',
        });
        expect(store.favoritesTemplates).toEqual(mockResponse);
      });
    });

    describe('setSelectedTemplateUuid', () => {
      it('should update selectedTemplateUuid', () => {
        const store = useMetaTemplateMessage();
        store.setSelectedTemplateUuid('template-123');

        expect(store.selectedTemplateUuid).toBe('template-123');
      });
    });

    describe('setSelectedFavorite', () => {
      it('should handle single template object', () => {
        const store = useMetaTemplateMessage();
        const template = { value: 'template-123' };

        store.setSelectedFavorite(template);

        expect(store.selectedFavoriteTemplate).toEqual([template]);
        expect(store.selectedTemplateUuid).toBe('template-123');
      });

      it('should handle array of templates', () => {
        const store = useMetaTemplateMessage();
        const templates = [{ value: 'template-123' }];

        store.setSelectedFavorite(templates);

        expect(store.selectedFavoriteTemplate).toEqual(templates);
        expect(store.selectedTemplateUuid).toBe('template-123');
      });

      it('should not update selectedTemplateUuid if value is empty', () => {
        const store = useMetaTemplateMessage();
        store.setSelectedTemplateUuid('original-uuid');

        const template = { value: '' };
        store.setSelectedFavorite(template);

        expect(store.selectedTemplateUuid).toBe('original-uuid');
      });
    });

    describe('setEmptyTemplates', () => {
      it('should update emptyTemplates state', () => {
        const store = useMetaTemplateMessage();
        store.setEmptyTemplates(true);

        expect(store.emptyTemplates).toBe(true);
      });
    });

    describe('handlerShowSearchTemplateModal', () => {
      it('should update showSearchTemplateMetaModal state', () => {
        const store = useMetaTemplateMessage();
        store.handlerShowSearchTemplateModal(true);

        expect(store.showSearchTemplateMetaModal).toBe(true);
      });
    });
  });
});
