# `<animated-highlight>`

The element `<animated-highlight>` does precisely one thing: it [slots](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/slot) another element and switches
classes on it. Its use case is to serve as a sort of runtime for code generated
by [diff2gif.com](https://diff2gif.com/). The element is extremely basic and
meant to be hacked and extended by you, the user.

## HTML API

### General usage

The element `<animated-highlight>` is a custom element with several slots,
attributes, and DOM properties for customization. To get it working, just
include `dist/bundle.js` in a script tag in your web page! A minimal example:

```html
<script src="dist/bundle.js"></script>
<animated-highlight controls keyframes="0 1 2 3">
  <div>Switch classes on me!</div>
</animated-highlight>
```

This will cycle classes on the `div` element wrapped by the custom elements from
`frame0` to `frame1` to `frame2` to `frame3`. The keyframes are defined as a
whitespace-separated list of numbers in the `keyframes` attribute while the
existence of the `controls` attribute provides basic forwards/backwards buttons.

Attribute summary:

* `controls`: When present, shows controls UI (by default just a pair of forwards/backwards buttons). Reflected by the DOM property `controls`
* `keyframes`: Defines the list of keyframes with a value of whitespace-separated positive integers. Values that are anything but a list of whitespace-separated numbers are equal to the attribute missing (eg. there are no keyframes at all in this case). The list of keyframes is always sorted in ascending order and cleared of any duplicates or non-numbers. Negative numbers are interpreted as positive numbers.
* `current`: Indicates the current frame. Can be changed to change the current frame. Reflected by the DOM property `current`. Values that are anything but a positive integer are treated as `0`.

### Custom controls

The default control UI for the element is basic and ugly. There are three
options to remedy this:

#### 1. Wrap the element

You can simply wrap an `<animated-highlight>` element *without* a `controls`
attribute and add your own custom logic that uses the JavaScript API described
below. This is probably the way to go for integration in frameworks like React.

#### 2. Style the controls

If you just want to reposition and re-style the existing controls, you can use
the following CSS [`::part()` selectors](https://developer.mozilla.org/en-US/docs/Web/CSS/::part):

* `animated-highlight::part(controls)`: The container element for the buttons
* `animated-highlight::part(controls-prevBtn)`: The "previous" buttons
* `animated-highlight::part(controls-nextBtn)`: The "next" buttons

The buttons are `<button>` elements with `<span>` elements inside.

#### 3. Replace the controls

The default controls are actually just fallback content for a shadow DOM slot.
This means that you can very easily just add your own:

```html
<animated-highlight controls keyframes="0 1 2 3">
  <div>Switch classes on me!</div>
  <div slot="controls">
    <div data-command="prev">Back</div>
    <div data-command="next">Next</div>
  </div>
</animated-hightlight>
```

All you need to do to make your custom buttons (in this case, `<div>` elements)
work is add the attributes `data-command="prev"` and `data-command="next"`
respectively. You can also build up your custom controls to do way more than
just provide two buttons. See `demo/index.html` for an example.

#### 4. Hack the element

The element's shadow root is open and most of the private properties on the
`AnimatedHighlight` class are not actually private. Go and mess with 'em!

## JavaScript API

This package provides an ECMAScript module that exports the class for the custom
element. To get it working, import the class from the module and register it as
a new element:

```javascript
import { AnimatedHighlight } from "animated-highlight";

window.customElements.get("animated-highlight") ??
  window.customElements.define("animated-highlight", AnimatedHighlight);

```

### getter/setter `controls` (boolean)

Reflects the HTML attribute `controls`. Setting this property to a falsy value
removes the attribute.

### getter/setter `current` (number)

Reflects the current keyframe. The setter coerces and rounds values to whole numbers and clamps them to the range of available keyframes.

### getter `nextCurrent` (number | null)

Reflects the keyframe the element is about to switch to during an
`ah-beforeframechange` event. This property is only set to a number during this
event and returns `null` at any other time.

### getter `maxFrame` (number)

Returns the last keyframe.

### getter/setter `keyframes` (Array<number>)

Reflects the HTML attribute `keyframes`. Setting this property to anything but
an array is equal to setting the property to an empty array.

### methods `next()` and `prev()`

Go to the next or previous keyframe respectively, unless the corresponding
`beforeframechange` event gets cancelled. Returns a number indicating the
new keyframe.

### Event `ah-beforeframechange` (bubbles, cancelable, not composed)

Fires before a frame change occurs. Call `preventDefault()` on the event to stop
the frame change from happening. You can inspect the event target's `current`
property to figure out the current frame and the event target's `nextCurrent`
property to see what the next frame is going to be... and then decide whether or
not you want to to stop the frame change.

### Event `ah-afterframechange` (bubbles, not cancelable, not composed)

As the name suggests, this is fired after a frame change has occurred.

## Notes

Neither dom properties nor HTML attributes for the events `ah-beforeframechange`
and `ah-afterframechange` are implemented! You *must* use `addEventListener()`,
attributes or properties like `onAhAfterframechange = ...` are not supported.

## Integrations

### TypeScript

The module provides types for the element's class `AnimatedHighlight` and adds
its declarations into `HTMLElementTagNameMap`. This ensures that built-ins like
`document.createElement()` know how to handle the new tag name
`animated-highlight`. Unless you want to use another tag name or integrate with
special HTML snowflakes like react, you don't have to do anything.
