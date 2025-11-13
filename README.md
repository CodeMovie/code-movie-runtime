# `<code-movie-runtime>` - Web runtime for [Code.Movie](https://code.movie/)

Convenient wrapper for [Code.Movie](https://code.movie/) animations that provides a basic high-level UI and DOM API via the custom element `<code-movie-runtime>`.

## Setup

You can install the library as `@codemovie/code-movie-runtime` from NPM, [download the latest release from GitHub](https://github.com/CodeMovie/code-movie-runtime/releases) or just grab `dist/index.js` [from the source code](https://github.com/CodeMovie/code-movie-runtime/tree/main/dist). The library exports the component class and auto-registers the tag name `code-movie-runtime`. You can throw the module into any web page without doing anything else and it will just work.

<!-- prettier-ignore -->
> [!IMPORTANT]
> **This package does _not_ bundle the Code.Movie core library!** You have to either manually install [@codemovie/code-movie](https://www.npmjs.com/package/@codemovie/code-movie) or load the relevant files from a CDN like [jsDelivr](https://www.jsdelivr.com/) as shown in the examples below.

The element works by [slotting](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot) another element (the animation) and switching classes on it. The element is extremely basic and meant to be used by other tools or hacked and extended by you, the user.

## HTML API

### General usage

The element `<code-movie-runtime>` is a custom HTML element with several slots, attributes, and DOM properties for customization. To get it working, just load `dist/index.js` as module in your web page! A minimal example:

```html
<script type="module" src="dist/index.js"></script>

<code-movie-runtime controls keyframes="0 1 2 3">
  <div>Switch classes on me!</div>
</code-movie-runtime>
```

This will render twe buttons below the `<div>`. Clicking on them cycles classes on the `<div>` from `frame0` to `frame1` to `frame2` to `frame3`. The keyframes are defined as a whitespace-separated list of numbers in the `keyframes` attribute while the existence of the `controls` attribute provides basic forwards/backwards buttons.

Attribute summary:

- `controls`: Boolean attribute. When present, shows controls UI (by default just a pair of forwards/backwards buttons). Reflected by the DOM property `controls`.
- `keyframes`: Defines the list of keyframes with a value of whitespace-separated positive integers. Values that are anything but a list of whitespace-separated integers are equal to the attribute missing (eg. there are no keyframes at all in this case). The list of keyframes is internally sorted in ascending order and cleared of any duplicates or non-numbers. Negative numbers are interpreted as positive numbers.
- `current`: Indicates the current frame index. Can be set to another number to change the current frame. Reflected by the DOM property `current`. Values that are anything but a positive integer are treated as `0`.

### Custom controls

The default control UI for the element is basic and ugly. There are three options to remedy this:

#### 1. Wrap the element

You can wrap a `<code-movie-runtime>` element _without_ a `controls` attribute and add your own custom logic that uses the JavaScript API described below. This is probably the way to go for integration in frameworks like React.

#### 2. Style the controls

If you just want to reposition and re-style the existing controls, you can use the following CSS [`::part()` selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/::part):

- `code-movie-runtime::part(controls)`: The container element for the buttons
- `code-movie-runtime::part(controls-prevBtn)`: The "previous" button
- `code-movie-runtime::part(controls-nextBtn)`: The "next" button

The buttons are `<button>` elements with `<span>` elements inside.

#### 3. Replace the controls

The default controls are actually just fallback content for a shadow DOM slot. This means that you can very easily add your own:

```html
<code-movie-runtime controls keyframes="0 1 2 3">
  <div>Switch classes on me!</div>
  <div slot="controls">
    <div data-command="prev">Back</div>
    <div data-command="next">Next</div>
  </div>
</code-movie-runtime>
```

All you need to do to make your custom buttons (in this case, `<div>` elements) work is to add the attributes `data-command="prev"` and `data-command="next"` respectively. You can also build up your custom controls to do way more than just provide two buttons. See `demo/index.html` for an example.

#### 4. Hack the element

The element's shadow root is open and most of the private properties on the `CodeMovieRuntime` class are not actually private. Go and mess with them!

### Auxiliary content

Elements assigned to the slot named `aux` are styled to be only visible when their class name matches the currently active frame:

```html
<code-movie-runtime controls keyframes="0 1 2">
  <div>Switch classes on me!</div>
  <p slot="aux" class="frame0">Only visible for step 0</p>
  <p slot="aux" class="frame1">Only visible for step 1</p>
  <p slot="aux" class="frame2">Only visible for step 2</p>
</code-movie-runtime>
```

## JavaScript API

Instances of `<code-movie-runtime>` implement the following DOM APIs:

### getter/setter `controls` (boolean)

Reflects the HTML attribute `controls`. Setting this property to a falsy value removes the attribute and makes the control UI invisible. Note that this also affects custom control UI that has been slotted.

### getter/setter `current` (number)

Reflects and sets the current keyframe. The setter can be used to navigate to a specific keyframe. It coerces and rounds values to integers and clamps them to the range of available keyframes.

### getter `nextCurrent` (number | null)

Reflects the keyframe the element is about to switch to during an `cm-beforeframechange` event. This property is only set during this event and returns `null` at any other time. The property can be inspected when handling a `cm-beforeframechange` and its value can be used to decide if the event should be canceled.

### getter `maxFrame` (number)

Returns the last keyframe.

### getter/setter `keyframes` (Array\<number\>)

Reflects the HTML attribute `keyframes`. Setting this property to anything but an array is equal to setting the property to an empty array. Non-numeric array contents is coerced to positive integers if possible and discarded otherwise.

### methods `next()` and `prev()`

Go to the next or previous keyframe respectively, unless the corresponding `cm-beforeframechange` event gets cancelled. Returns a number indicating the new keyframe.

### method `go(value: number): number`

Sets the current keyframe to the specified value just like the setter for `current` does. Coerces and rounds input values to integers and clamps them to the range of available keyframes. Returns the current keyframe.

### Event `cm-beforeframechange` (bubbles, cancelable, not composed)

Fires before a frame change occurs. Call `preventDefault()` on the event to stop the frame change from happening. You can inspect the event target's `current` property to figure out the current frame and the event target's `nextCurrent` property to see what the next frame is going to be and then decide whether or not you want to to stop the frame change.

### Event `cm-afterframechange` (bubbles, not cancelable, not composed)

As the name suggests, this is fired after a frame change has occurred.

## CSS API

The element uses its [custom state set](https://developer.mozilla.org/en-US/docs/Web/API/CustomStateSet) to track the current frame. If the current frame is 7 for example, the CSS selector `code-movie-runtime:state(frame7)` will match. There are also the custom states `hasNext` and `hasPrev`, which indicate if the element is at its first or last keyframe.

The default shadow DOM template by overriding the static method `_template`. The default template provides several [shadow parts](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_shadow_parts) for your CSS to hook into:

- `wrapper`
  - `controls-wrapper`
    - `controls` (default controls, can be replaced entirely as explained above)
      - `controls-prevBtn`
      - `controls-nextBtn`
  - `aux-wrapper`

## Notes

Neither dom properties nor HTML attributes for the events `cm-beforeframechange` and `cm-afterframechange` are implemented! You _must_ use `addEventListener()`, attributes or properties like `onCmAfterframechange = ...` are **not supported.**

## Integrations

### TypeScript

The module provides types for the element's class `CodeMovieRuntime` and adds its declarations into `HTMLElementTagNameMap`. This ensures that built-ins like `document.createElement()` know how to handle the new tag name `code-movie-runtime`. Unless you want to use another tag name or integrate with special HTML snowflakes like React, you don't have to do anything.
