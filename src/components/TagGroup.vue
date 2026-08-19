<!-- Component copied from WeniChats -->
<template>
  <section :class="{ 'tag-group': true, flex }">
    <div
      v-if="tags.length > 0"
      ref="container"
      class="tag-group__tags"
    >
      <UnnnicTag
        v-for="(tag, i) in tags"
        :key="tag.uuid"
        :ref="(el) => setTagRef(tag.uuid, el)"
        :clickable="selectable"
        :text="tag.name"
        :data-testid="`tag__${tag.uuid}`"
        :hasCloseIcon="showCloseIcon(tag)"
        :disabled="
          !scheme && !hasCloseIcon && selectable && !isSelectedTag(tag)
        "
        :class="{ 'tag-group__tags__tag--selected': isSelectedTag(tag) }"
        :scheme="scheme || schemes[i % schemes.length]"
      />
      <p
        v-if="remainingTags > 0"
        ref="remainingTagsRef"
        :title="tagNames.join(', ')"
        class="tag-group__remaining-children"
      >
        +{{ remainingTags }}
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

defineOptions({ name: 'TagGroup' });

interface Tag {
  uuid: string;
  name: string;
}

interface TagGroupProps {
  hasCloseIcon?: boolean;
  selectable?: boolean;
  flex?: boolean;
  scheme?: string;
  tags?: Tag[];
  value?: Tag[];
}

const props = withDefaults(defineProps<TagGroupProps>(), {
  hasCloseIcon: false,
  selectable: false,
  flex: true,
  scheme: '',
  tags: () => [],
  value: () => [],
});

const emit = defineEmits<{
  input: [tags: Tag[]];
  close: [];
}>();

const schemes = [
  'aux-purple',
  'aux-orange',
  'aux-pink',
  'brand-weni-dark',
  'weni-600',
  'aux-lemon',
  'aux-blue',
  'neutral-dark',
  'neutral-cloudy',
];

const remainingTags = ref(0);
const container = ref<HTMLElement | null>(null);
const remainingTagsRef = ref<HTMLElement | null>(null);
const tagRefs: Record<string, any> = {};

const setTagRef = (uuid: string, el: any) => {
  if (el) tagRefs[uuid] = el;
  else delete tagRefs[uuid];
};

const getTagElement = (uuid: string) => {
  const instance = tagRefs[uuid];
  return instance?.[0]?.$el ?? instance?.$el;
};

const selected = computed({
  get: () => props.value,
  set: (tags) => emit('input', tags),
});

const tagNames = computed(() => props.tags.map((tag) => tag.name));

const isSelectedTag = (tag: Tag) =>
  selected.value.find((mappedTag) => mappedTag.uuid === tag.uuid);

const showCloseIcon = (tag: Tag) =>
  props.hasCloseIcon || (props.selectable && isSelectedTag(tag));

const handleIntersection = (entries: IntersectionObserverEntry[]) => {
  entries.forEach((entry) => {
    let remainingTagsPos: string | number = '';

    if (entry.isIntersecting) {
      remainingTags.value -= 1;
      remainingTagsPos =
        (entry.target as HTMLElement).offsetLeft +
        entry.boundingClientRect.width;
    } else {
      remainingTags.value += 1;

      const refName = entry.target.getAttribute('data-ref-name');
      const tagIndex = props.tags.findIndex((tag) => tag.uuid === refName);

      if (tagIndex > 0) {
        const lastChildUuid = props.tags[tagIndex - 1].uuid;
        const lastElement = getTagElement(lastChildUuid);

        if (lastElement) {
          const lastElementBoundingRect = lastElement.getBoundingClientRect();
          remainingTagsPos =
            lastElement.offsetLeft + lastElementBoundingRect.width;
        }
      }
    }

    function addPx(string: string | number) {
      return `${string}px`;
    }

    if (remainingTagsRef.value && container.value) {
      const remainingTagsPaddingLeft = Number.parseFloat(
        getComputedStyle(remainingTagsRef.value).paddingLeft,
      );
      container.value.style.paddingRight = addPx(
        remainingTagsRef.value.offsetWidth + remainingTagsPaddingLeft,
      );

      remainingTagsRef.value.style.left = addPx(remainingTagsPos);
    }
  });
};

onMounted(() => {
  if (props.flex) {
    return;
  }

  remainingTags.value = props.tags.length - 1;

  const observer = new IntersectionObserver(handleIntersection);
  props.tags.forEach((child) => {
    const tagElement = getTagElement(child.uuid);
    tagElement.setAttribute('data-ref-name', child.uuid);

    observer.observe(tagElement);
  });
});
</script>

<style lang="scss" scoped>
$tag-size: 28px;
.tag-group {
  display: flex;
  overflow-y: hidden;
  align-items: center;

  &:not(.flex) {
    height: $tag-size;
  }

  &__tags {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    gap: $unnnic-space-2;
    flex: 1;

    align-self: flex-start;
    user-select: none;
    overflow: hidden;

    :deep(.unnnic-tag) {
      width: min-content;
      max-width: 100%;

      .unnnic-tag__label {
        width: 100%;

        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
      }

      &.tag-group__tags__tag--selected {
        outline: 1px solid $unnnic-color-gray-5;
        outline-offset: -1px;
      }
    }
  }

  &__remaining-children {
    position: absolute;
    padding-left: $unnnic-space-2;

    color: $unnnic-color-gray-10;
    font: $unnnic-font-caption-2;
    margin-right: -16px;

    top: calc($tag-size / 2);
    transform: translateY(-50%);
  }
}
</style>
