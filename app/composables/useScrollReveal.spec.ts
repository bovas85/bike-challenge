import { mount } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import { defineComponent } from "vue";
import { useScrollReveal } from "./useScrollReveal";

vi.mock("scrollama", () => ({
  default: () => ({
    setup: vi.fn().mockReturnValue({
      onStepEnter: vi.fn((cb: (res: { index: number }) => void) => {
        cb({ index: 0 });
      }),
    }),
    resize: vi.fn(),
    destroy: vi.fn(),
  }),
}));

describe("useScrollReveal", () => {
  it("marks headerAnimated on mount and reveals steps via Scrollama and viewport checks", async () => {
    const TestHost = defineComponent({
      setup() {
        return useScrollReveal(2, {
          stepSelector: ".test-step",
          offset: 0.8,
        });
      },
      template: `
        <div>
          <header :class="{ animated: headerAnimated }">Hero</header>
          <section class="test-step" :class="{ animated: stepAnimated[0] }">Step 0</section>
          <section class="test-step" :class="{ animated: stepAnimated[1] }">Step 1</section>
        </div>
      `,
    });

    const wrapper = mount(TestHost, { attachTo: document.body });
    await wrapper.vm.$nextTick();

    expect(wrapper.vm.headerAnimated).toBe(true);
    expect(wrapper.vm.stepAnimated[0]).toBe(true);

    window.dispatchEvent(new Event("resize"));
    window.dispatchEvent(new Event("scroll"));

    wrapper.unmount();
  });
});
