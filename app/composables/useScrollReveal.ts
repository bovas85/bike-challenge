import scrollama, {
  type ScrollamaInstance,
  type ScrollamaResponse,
} from "scrollama";
import { nextTick, onBeforeUnmount, onMounted, ref, type Ref } from "vue";

export interface ScrollRevealOptions {
  /** Selector for scrollama step containers */
  stepSelector: string;
  /** Viewport offset threshold (0..1) where step enters */
  offset?: number;
}

/**
 * Sets up Scrollama-driven reveal flags matching nunziellasalluce.com
 * and Framer's viewport appear animations, with an automatic fallback
 * when elements are already above the fold or in headless/test environments.
 */
export function useScrollReveal(
  stepCount: number,
  options: ScrollRevealOptions,
): {
  headerAnimated: Ref<boolean>;
  stepAnimated: Ref<boolean[]>;
} {
  const headerAnimated = ref(false);
  const stepAnimated = ref<boolean[]>(
    Array.from({ length: stepCount }, () => false),
  );
  let scroller: ScrollamaInstance | null = null;

  const markStep = (index: number) => {
    if (index >= 0 && index < stepAnimated.value.length) {
      stepAnimated.value[index] = true;
    }
  };

  const handleStepEnter = (response: ScrollamaResponse) => {
    markStep(response.index);
  };

  const handleResize = () => {
    if (scroller) scroller.resize();
  };

  const revealVisibleSteps = () => {
    if (typeof document === "undefined" || typeof window === "undefined")
      return;
    const els = document.querySelectorAll<HTMLElement>(options.stepSelector);
    const triggerY = window.innerHeight * (options.offset ?? 0.85);
    els.forEach((el, idx) => {
      const rect = el.getBoundingClientRect();
      if (rect.top <= triggerY) {
        markStep(idx);
      }
    });
  };

  onMounted(async () => {
    headerAnimated.value = true;
    if (!import.meta.client) return;

    await nextTick();
    revealVisibleSteps();

    try {
      const steps = document.querySelectorAll(options.stepSelector);
      if (steps.length > 0) {
        scroller = scrollama();
        scroller
          .setup({
            step: options.stepSelector,
            offset: options.offset ?? (window.innerWidth > 809 ? 0.75 : 0.85),
            debug: false,
          })
          .onStepEnter(handleStepEnter);

        window.addEventListener("resize", handleResize, { passive: true });
        window.addEventListener("scroll", revealVisibleSteps, {
          passive: true,
        });
      }
    } catch {
      // Fallback: reveal all steps if IntersectionObserver/Scrollama is unavailable
      stepAnimated.value = stepAnimated.value.map(() => true);
    }
  });

  onBeforeUnmount(() => {
    if (scroller) {
      scroller.destroy();
      scroller = null;
    }
    if (import.meta.client && typeof window !== "undefined") {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", revealVisibleSteps);
    }
  });

  return {
    headerAnimated,
    stepAnimated,
  };
}
