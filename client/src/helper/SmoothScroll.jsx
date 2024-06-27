import { useIsomorphicLayoutEffect } from "./useIsomorphicLayoutEffect";
import Lenis from "@studio-freight/lenis";

export default function SmoothScroll() {
  useIsomorphicLayoutEffect(() => {
    const lenis = new Lenis({
      easing: easeOutBack,
      duration: 2,
    });

    function easeOutBack(x) {
      const c1 = 1.70158;
      const c3 = c1 + 1;

      return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
    }

    lenis.on("scroll", (e) => {});

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);
  }, []);
}
