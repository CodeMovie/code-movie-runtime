# Changelog

## 2.4.0

- **Feature:** New static factory method `with(length)`.

## 2.3.0

- **Feature:** `<code-movie-runtime>` now tracks whether it is at its first or last keyframe in its [custom state set](https://developer.mozilla.org/en-US/docs/Web/API/CustomStateSet) via the states `hasNext` and `hasPrev`.

## 2.2.0

- **Feature:** `<code-movie-runtime>` now uses its [custom state set](https://developer.mozilla.org/en-US/docs/Web/API/CustomStateSet) to track the current frame. If the current frame is 7 for example, the CSS selector `code-movie-runtime:state(frame7)` will match.
- **Feature**: support auxiliary content via the `aux` slot

## 2.1.0

- **Feature:** the new DOM method: `go(targetKeyframe)` can be used as an alternative way to navigate to specific keyframes. The setter `current` does the same thing, but if you'd rather use a method, `go()` has you covered.
- **Improvement:** the element now keeps its slotted content's class names up to date even if that content changes. This should make the element overall more reliable.
- **Feature:** add a changelog!
