<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from "vue";
import Config from "~/assets/config";
import type { XmasLotteryPageACF } from "~/types/acf";

defineOptions({ name: "XmasLotteryJoinModal" });

const props = defineProps<{
  open: boolean;
  modal: XmasLotteryPageACF["modal"];
}>();

const emit = defineEmits<{
  close: [];
}>();

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 254;

const email = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");
const alreadyEntered = ref(false);
const hasSucceeded = ref(false);
const dialogRef = ref<HTMLElement | null>(null);
const emailInput = ref<HTMLInputElement | null>(null);
const doneButton = ref<HTMLButtonElement | null>(null);
let previouslyFocusedElement: HTMLElement | null = null;

function handleClose() {
  if (isSubmitting.value) {
    return;
  }
  emit("close");
}

function getFocusableElements(): HTMLElement[] {
  if (!dialogRef.value) return [];
  return Array.from(
    dialogRef.value.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
}

function handleKeydown(event: KeyboardEvent) {
  if (!props.open) return;

  if (event.key === "Escape") {
    event.preventDefault();
    handleClose();
    return;
  }

  if (event.key === "Tab") {
    const focusable = getFocusableElements();
    if (focusable.length === 0) return;
    const first = focusable[0]!;
    const last = focusable[focusable.length - 1]!;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (typeof window === "undefined") {
      return;
    }

    if (isOpen) {
      previouslyFocusedElement =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      errorMessage.value = "";
      alreadyEntered.value = false;
      hasSucceeded.value = false;
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeydown);
      await nextTick();
      emailInput.value?.focus();
    } else {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeydown);
      previouslyFocusedElement?.focus();
      previouslyFocusedElement = null;
    }
  },
);

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    document.body.style.overflow = "";
    window.removeEventListener("keydown", handleKeydown);
  }
});

async function handleSubmit() {
  errorMessage.value = "";
  alreadyEntered.value = false;

  const normalizedEmail = email.value.trim().toLowerCase();
  if (
    !normalizedEmail ||
    normalizedEmail.length > MAX_EMAIL_LENGTH ||
    !EMAIL_PATTERN.test(normalizedEmail)
  ) {
    errorMessage.value = "Please enter a valid email address.";
    return;
  }

  isSubmitting.value = true;

  try {
    await $fetch(Config.api.xmasLotteryEnter, {
      method: "POST",
      body: { email: normalizedEmail },
    });
    hasSucceeded.value = true;
    email.value = "";
    await nextTick();
    doneButton.value?.focus();
  } catch (err: unknown) {
    const fetchErr = err as {
      statusCode?: number;
      status?: number;
      data?: { statusCode?: number; statusMessage?: string; message?: string };
      statusMessage?: string;
      message?: string;
    };
    const status =
      fetchErr?.statusCode || fetchErr?.status || fetchErr?.data?.statusCode;
    if (status === 409) {
      alreadyEntered.value = true;
      errorMessage.value = props.modal.alreadyEnteredMessage;
    } else {
      errorMessage.value =
        fetchErr?.data?.statusMessage ||
        fetchErr?.statusMessage ||
        fetchErr?.data?.message ||
        "Something went wrong. Please try again.";
    }
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <div
    v-if="open"
    class="xmas-modal-backdrop"
    role="presentation"
    @click.self="handleClose"
  >
    <div
      ref="dialogRef"
      class="xmas-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="xmas-lottery-modal-title"
      aria-describedby="xmas-lottery-modal-subtitle"
    >
      <button
        type="button"
        class="xmas-modal__close"
        :aria-label="modal.closeLabel"
        :disabled="isSubmitting"
        @click="handleClose"
      >
        &times;
      </button>

      <div v-if="hasSucceeded" class="xmas-modal__success" role="status">
        <span class="xmas-modal__badge" aria-hidden="true">Entered</span>
        <h2 id="xmas-lottery-modal-title" class="xmas-modal__title">
          {{ modal.successTitle }}
        </h2>
        <p id="xmas-lottery-modal-subtitle" class="xmas-modal__subtitle">
          {{ modal.successMessage }}
        </p>
        <button
          ref="doneButton"
          type="button"
          class="bc-btn bc-btn--amber-dark xmas-modal__done"
          @click="handleClose"
        >
          Done
        </button>
      </div>

      <template v-else>
        <h2 id="xmas-lottery-modal-title" class="xmas-modal__title">
          {{ modal.title }}
        </h2>
        <p id="xmas-lottery-modal-subtitle" class="xmas-modal__subtitle">
          {{ modal.subtitle }}
        </p>

        <form
          class="xmas-modal__form"
          novalidate
          aria-label="Xmas Lottery email entry"
          @submit.prevent="handleSubmit"
        >
          <div class="xmas-modal__field">
            <label for="xmas-lottery-email" class="xmas-modal__label">
              {{ modal.emailLabel }}
            </label>
            <input
              id="xmas-lottery-email"
              ref="emailInput"
              v-model="email"
              type="email"
              name="email"
              autocomplete="email"
              inputmode="email"
              class="xmas-modal__input"
              :placeholder="modal.emailPlaceholder"
              required
            />
          </div>

          <p
            v-if="errorMessage"
            class="xmas-modal__banner"
            :class="
              alreadyEntered
                ? 'xmas-modal__banner--info'
                : 'xmas-modal__banner--error'
            "
            role="alert"
          >
            {{ errorMessage }}
          </p>

          <button
            type="submit"
            class="bc-btn bc-btn--amber-dark xmas-modal__submit"
            :disabled="isSubmitting"
            :aria-busy="isSubmitting"
          >
            {{ isSubmitting ? "Submitting..." : modal.submitLabel }}
          </button>
        </form>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.xmas-modal-backdrop {
  position: fixed;
  inset: 0;
  z-index: 100;
  background-color: rgb(18 18 18 / 68%);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.xmas-modal {
  position: relative;
  width: 100%;
  max-width: 440px;
  background-color: $white;
  color: $ink;
  border-radius: 20px;
  padding: 36px 28px 32px;
  box-shadow: 0 24px 60px rgb(0 0 0 / 28%);

  @include tablet-up {
    padding: 40px 36px 36px;
  }

  &__close {
    position: absolute;
    top: 14px;
    right: 14px;
    width: 36px;
    height: 36px;
    border: 0;
    border-radius: 999px;
    background-color: #f4f4f4;
    color: $ink;
    font-size: 24px;
    line-height: 1;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background-color 0.15s ease;

    &:hover:not(:disabled) {
      background-color: #e5e5e5;
    }

    &:focus-visible {
      outline: 2px solid $amber;
      outline-offset: 2px;
    }
  }

  &__title {
    font-family: $font-primary;
    font-size: 28px;
    font-weight: 800;
    line-height: 1.15;
    letter-spacing: -0.03em;
    color: $black;
    margin-bottom: 10px;
    padding-right: 32px;
  }

  &__subtitle {
    font-family: $font-ui;
    font-size: 15px;
    font-weight: 400;
    line-height: 22px;
    color: $charcoal;
    margin-bottom: 24px;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__label {
    font-family: $font-ui;
    font-size: 13px;
    font-weight: 600;
    line-height: 16px;
    color: $ink;
  }

  &__input {
    width: 100%;
    height: 46px;
    padding: 10px 14px;
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

  &__banner {
    font-family: $font-ui;
    font-size: 13px;
    font-weight: 500;
    line-height: 18px;
    padding: 10px 12px;
    border-radius: 10px;
    margin: 0;

    &--error {
      background-color: #fdecea;
      color: #b42318;
      border: 1px solid #f5c2be;
    }

    &--info {
      background-color: #fff8eb;
      color: #8a4b00;
      border: 1px solid #f5d08a;
    }
  }

  &__submit,
  &__done {
    width: 100%;
    border: 0;
    min-height: 48px;

    &:disabled {
      opacity: 0.65;
      cursor: not-allowed;
      transform: none;
    }

    &:focus-visible {
      outline: 2px solid $black;
      outline-offset: 2px;
    }
  }

  &__success {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  &__badge {
    display: inline-flex;
    align-items: center;
    padding: 5px 12px;
    border-radius: 999px;
    background-color: #ecfdf3;
    color: #067647;
    border: 1px solid #abefc6;
    font-family: $font-ui;
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    margin-bottom: 14px;
  }
}
</style>
