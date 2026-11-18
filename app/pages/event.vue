<script setup lang="ts">
import { ref } from "vue";
import { useScrollReveal } from "~/composables/useScrollReveal";
import { useEventContent } from "~/composables/useSiteContent";

defineOptions({ name: "EventPage" });

const { data: eventData } = await useEventContent();

const { headerAnimated, stepAnimated } = useScrollReveal(1, {
  stepSelector: ".event-page .step",
});

useHead(() => ({
  title: `${eventData.value.title} | ${eventData.value.brandHeader}`,
}));

const name = ref("");
const email = ref("");
const isSubmitting = ref(false);
const errorMessage = ref("");
const successMessage = ref("");

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function handleSubmit() {
  errorMessage.value = "";
  successMessage.value = "";

  const trimmedName = name.value.trim();
  const trimmedEmail = email.value.trim();

  if (!trimmedName) {
    errorMessage.value = "Please enter your name.";
    return;
  }

  if (!trimmedEmail || !EMAIL_PATTERN.test(trimmedEmail)) {
    errorMessage.value = "Please enter a valid email address.";
    return;
  }

  isSubmitting.value = true;

  try {
    await $fetch("/api/event-rsvp", {
      method: "POST",
      body: {
        name: trimmedName,
        email: trimmedEmail,
      },
    });
    successMessage.value = eventData.value.form.successMessage;
    name.value = "";
    email.value = "";
  } catch (err: unknown) {
    const fetchErr = err as {
      data?: { statusMessage?: string; message?: string };
      statusMessage?: string;
      message?: string;
    };
    errorMessage.value =
      fetchErr?.data?.statusMessage ||
      fetchErr?.statusMessage ||
      fetchErr?.data?.message ||
      "Something went wrong. Please try again.";
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <main class="event-page">
    <header class="event-header">
      <div class="event-header__inner" :class="{ animated: headerAnimated }">
        <h1 class="event-header__brand">
          <NuxtLink to="/" class="event-header__brand-link">
            {{ eventData.brandHeader }}
          </NuxtLink>
        </h1>
        <h2 class="event-header__title">
          {{ eventData.title }}
        </h2>
      </div>
    </header>

    <section class="event-content step" aria-labelledby="event-details-heading">
      <h2 id="event-details-heading" class="sr-only">
        {{ eventData.title }} Details and RSVP
      </h2>

      <div class="event-content__grid">
        <div class="event-details" :class="{ animated: stepAnimated[0] }">
          <p
            v-for="(paragraph, index) in eventData.paragraphs"
            :key="index"
            class="event-details__paragraph"
          >
            {{ paragraph }}
          </p>

          <ul class="event-details__list">
            <li
              v-for="detail in eventData.details"
              :key="detail.label"
              class="event-details__item"
            >
              <span
                >{{ detail.icon }} {{ detail.label }}: {{ detail.value }}</span
              >
            </li>
          </ul>

          <p class="event-details__closing">
            {{ eventData.closingNote }}
          </p>
        </div>

        <div class="event-poster" :class="{ animated: stepAnimated[0] }">
          <img
            :src="eventData.posterImage.url"
            :alt="eventData.posterImage.alt"
            class="event-poster__image"
            width="620"
            height="620"
          />
        </div>
      </div>

      <form
        class="event-form"
        :class="{ animated: stepAnimated[0] }"
        novalidate
        aria-label="Event RSVP"
        @submit.prevent="handleSubmit"
      >
        <div class="event-form__field">
          <label for="rsvp-name" class="event-form__label">
            {{ eventData.form.nameLabel }}
          </label>
          <input
            id="rsvp-name"
            v-model="name"
            type="text"
            name="name"
            class="event-form__input"
            :placeholder="eventData.form.namePlaceholder"
            autocomplete="name"
            required
          />
        </div>

        <div class="event-form__field">
          <label for="rsvp-email" class="event-form__label">
            {{ eventData.form.emailLabel }}
          </label>
          <input
            id="rsvp-email"
            v-model="email"
            type="email"
            name="email"
            class="event-form__input"
            :placeholder="eventData.form.emailPlaceholder"
            autocomplete="email"
            required
          />
        </div>

        <p
          v-if="errorMessage"
          class="event-form__banner event-form__banner--error"
          role="alert"
        >
          {{ errorMessage }}
        </p>

        <p
          v-if="successMessage"
          class="event-form__banner event-form__banner--success"
          role="status"
        >
          {{ successMessage }}
        </p>

        <button
          type="submit"
          class="event-form__submit"
          :disabled="isSubmitting"
          :aria-busy="isSubmitting"
        >
          {{ isSubmitting ? "Submitting..." : eventData.form.submitLabel }}
        </button>
      </form>
    </section>
  </main>
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

.event-page {
  width: 100%;
  background-color: $cream;
}

.event-header {
  width: 100%;
  background-color: $amber;
  padding: 50px 24px;
  text-align: center;

  &__inner {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    flex-direction: column;
    align-items: center;

    @include fadeInUp(32px, 0.5s, 0.1s);
  }

  &__brand {
    font-family: $font-display;
    font-size: 48px;
    font-weight: 400;
    line-height: 1;
    letter-spacing: -0.04em;
    color: $black;

    @include tablet-up {
      font-size: 64px;
    }

    @include desktop-up {
      font-size: 80px;
    }
  }

  &__brand-link {
    display: inline-block;
    color: inherit;
    text-decoration: none;
    transition: opacity 0.2s ease;

    &:hover {
      opacity: 0.8;
    }
  }

  &__title {
    font-family: $font-primary;
    font-size: 28px;
    font-weight: 900;
    line-height: 1.05;
    letter-spacing: -0.04em;
    color: $white;

    @include tablet-up {
      font-size: 40px;
      line-height: 1;
    }
  }
}

.event-content {
  width: 100%;
  background-color: $white;
  padding: 48px 20px 80px;

  @include tablet-up {
    padding-top: 80px;
  }

  &__grid {
    max-width: 1240px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr;
    gap: 40px;
    align-items: start;

    @include tablet-up {
      grid-template-columns: minmax(0, 1fr) minmax(0, 620px);
      justify-content: space-between;
    }
  }
}

.event-details {
  max-width: 447px;
  font-family: $font-ui;
  font-size: 20px;
  font-weight: 400;
  line-height: 24px;
  letter-spacing: -0.01em;
  color: $black;

  @include fadeInUp(36px, 0.55s, 0.05s);

  @include tablet-up {
    margin-left: 87px;
    font-size: 22px;
    line-height: 26.4px;
  }

  &__paragraph,
  &__closing {
    margin: 0;
  }

  &__list {
    list-style: none;
    margin: 0;
    padding: 0 0 0 28px;
  }

  &__item {
    margin: 0;
  }
}

.event-poster {
  width: 100%;
  max-width: 620px;
  justify-self: center;

  @include fadeInUp(36px, 0.55s, 0.15s);

  @include tablet-up {
    justify-self: end;
  }

  &__image {
    width: 100%;
    height: auto;
    aspect-ratio: 1 / 1;
    object-fit: cover;
    border-radius: 20px;
    display: block;
  }
}

.event-form {
  max-width: 280px;
  margin: 40px auto 0;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 20px;

  @include fadeInUp(32px, 0.55s, 0.25s);

  @include tablet-up {
    margin-top: 0;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  &__label {
    font-family: $font-ui;
    font-size: 12px;
    font-weight: 500;
    line-height: 14.4px;
    color: $muted-dark;
  }

  &__input {
    width: 100%;
    height: 40px;
    padding: 10px 12px;
    font-family: $font-ui;
    font-size: 14px;
    font-weight: 400;
    line-height: 16.8px;
    color: $ink;
    background-color: #f4f4f4;
    border: 1px solid #e5e5e5;
    border-radius: 10px;
    outline: none;
    transition:
      border-color 0.2s ease,
      background-color 0.2s ease;

    &::placeholder {
      color: $muted;
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
    border-radius: 8px;
    margin: 0;

    &--error {
      background-color: #fdecea;
      color: #b42318;
      border: 1px solid #f5c2be;
    }

    &--success {
      background-color: #ecfdf3;
      color: #067647;
      border: 1px solid #abefc6;
    }
  }

  &__submit {
    width: 100%;
    height: 40px;
    background-color: $charcoal;
    color: $white;
    font-family: $font-ui;
    font-size: 14px;
    font-weight: 600;
    line-height: 16.8px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition:
      opacity 0.2s ease,
      transform 0.15s ease;

    &:hover:not(:disabled) {
      opacity: 0.9;
    }

    &:disabled {
      opacity: 0.65;
      cursor: not-allowed;
    }
  }
}
</style>
