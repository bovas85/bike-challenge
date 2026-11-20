<script setup lang="ts">
import { computed } from "vue";

defineOptions({ name: "OfferFilters" });

const props = defineProps<{
  brandQuery: string;
  selectedDiscount: number | null;
  discountOptions: number[];
  totalCount: number;
  filteredCount: number;
}>();

const emit = defineEmits<{
  "update:brandQuery": [value: string];
  "update:selectedDiscount": [value: number | null];
  reset: [];
}>();

const hasActiveFilters = computed(
  () => props.brandQuery.trim().length > 0 || props.selectedDiscount !== null,
);

const resultsSummary = computed(() => {
  if (!hasActiveFilters.value) {
    return `${props.totalCount} partner ${props.totalCount === 1 ? "offer" : "offers"}`;
  }
  return `Showing ${props.filteredCount} of ${props.totalCount} ${props.totalCount === 1 ? "offer" : "offers"}`;
});

function onSearchInput(event: Event) {
  const target = event.target as HTMLInputElement;
  emit("update:brandQuery", target.value);
}

function clearSearch() {
  emit("update:brandQuery", "");
}

function selectDiscount(pct: number | null) {
  if (pct !== null && props.selectedDiscount === pct) {
    emit("update:selectedDiscount", null);
    return;
  }
  emit("update:selectedDiscount", pct);
}
</script>

<template>
  <section class="offer-filters" aria-label="Filter partner offers">
    <div class="offer-filters__inner">
      <div class="offer-filters__controls">
        <div class="offer-filters__search">
          <label for="offer-brand-search" class="sr-only">
            Filter by brand name
          </label>
          <svg
            class="offer-filters__search-icon"
            viewBox="0 0 20 20"
            fill="none"
            aria-hidden="true"
            focusable="false"
          >
            <circle
              cx="9"
              cy="9"
              r="6"
              stroke="currentColor"
              stroke-width="1.8"
            />
            <path
              d="m13.5 13.5 4 4"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
            />
          </svg>
          <input
            id="offer-brand-search"
            :value="brandQuery"
            type="text"
            inputmode="search"
            autocomplete="off"
            class="offer-filters__input"
            placeholder="Search by brand name..."
            aria-label="Filter offers by brand name"
            @input="onSearchInput"
          />
          <button
            v-if="brandQuery.length > 0"
            type="button"
            class="offer-filters__clear-input"
            aria-label="Clear brand search"
            @click="clearSearch"
          >
            &times;
          </button>
        </div>

        <div
          v-if="discountOptions.length > 0"
          class="offer-filters__discounts"
          role="group"
          aria-label="Filter by discount percentage"
        >
          <button
            type="button"
            class="offer-filters__pill"
            :class="{
              'offer-filters__pill--active': selectedDiscount === null,
            }"
            :aria-pressed="selectedDiscount === null"
            @click="selectDiscount(null)"
          >
            All
          </button>
          <button
            v-for="pct in discountOptions"
            :key="pct"
            type="button"
            class="offer-filters__pill"
            :class="{
              'offer-filters__pill--active': selectedDiscount === pct,
            }"
            :aria-pressed="selectedDiscount === pct"
            @click="selectDiscount(pct)"
          >
            {{ pct }}%
          </button>
        </div>
      </div>

      <div class="offer-filters__meta">
        <p class="offer-filters__count" role="status" aria-live="polite">
          {{ resultsSummary }}
        </p>
        <button
          v-if="hasActiveFilters"
          type="button"
          class="offer-filters__reset"
          @click="emit('reset')"
        >
          Clear filters
        </button>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
  border: 0;
}

.offer-filters {
  width: 100%;
  padding: 0 20px 32px;

  &__inner {
    max-width: 960px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  &__controls {
    display: flex;
    flex-direction: column;
    gap: 14px;

    @include tablet-up {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 20px;
    }
  }

  &__search {
    position: relative;
    width: 100%;

    @include tablet-up {
      max-width: 360px;
      flex: 1 1 280px;
    }
  }

  &__search-icon {
    position: absolute;
    left: 14px;
    top: 50%;
    transform: translateY(-50%);
    width: 18px;
    height: 18px;
    color: $muted-dark;
    pointer-events: none;
  }

  &__input {
    width: 100%;
    height: 44px;
    padding: 10px 40px;
    font-family: $font-ui;
    font-size: 15px;
    font-weight: 400;
    line-height: 20px;
    color: $ink;
    background-color: #f4f4f4;
    border: 1px solid #e5e5e5;
    border-radius: 12px;
    outline: none;
    transition:
      border-color 0.2s ease,
      background-color 0.2s ease;

    &::placeholder {
      color: $muted-dark;
    }

    &:focus {
      background-color: $white;
      border-color: $amber;
    }
  }

  &__clear-input {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    width: 28px;
    height: 28px;
    border: 0;
    border-radius: 999px;
    background-color: transparent;
    color: $charcoal;
    font-size: 20px;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.15s ease;

    &:hover {
      background-color: rgb(0 0 0 / 8%);
    }

    &:focus-visible {
      outline: 2px solid $amber;
      outline-offset: 1px;
    }
  }

  &__discounts {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }

  &__pill {
    min-height: 38px;
    padding: 8px 16px;
    border-radius: 999px;
    border: 1px solid #e5e5e5;
    background-color: #f4f4f4;
    color: $ink;
    font-family: $font-ui;
    font-size: 14px;
    font-weight: 600;
    line-height: 1;
    cursor: pointer;
    transition:
      background-color 0.15s ease,
      border-color 0.15s ease,
      color 0.15s ease,
      transform 0.15s ease;

    &:hover {
      border-color: $charcoal;
    }

    &:focus-visible {
      outline: 2px solid $amber;
      outline-offset: 2px;
    }

    &--active {
      background-color: $black;
      border-color: $black;
      color: $white;

      &:hover {
        border-color: $black;
        opacity: 0.9;
      }
    }
  }

  &__meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 24px;
  }

  &__count {
    font-family: $font-ui;
    font-size: 14px;
    font-weight: 500;
    line-height: 20px;
    color: $charcoal;
  }

  &__reset {
    border: 0;
    background: transparent;
    padding: 2px 4px;
    font-family: $font-ui;
    font-size: 14px;
    font-weight: 600;
    line-height: 20px;
    color: $black;
    text-decoration: underline;
    cursor: pointer;
    transition: opacity 0.15s ease;

    &:hover {
      opacity: 0.7;
    }

    &:focus-visible {
      outline: 2px solid $amber;
      outline-offset: 2px;
      border-radius: 4px;
    }
  }
}
</style>
