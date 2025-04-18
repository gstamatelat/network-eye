<template>
  <div ref="tooltip" class="bg-gray-900 py-2 px-3 text-sm font-medium text-white rounded-lg shadow-sm max-w-xs z-40"
    :class="{ hidden: !visible }">
    <slot></slot>
  </div>
</template>

<script lang="ts" setup>
import { type Ref } from 'vue'
import { createPopper, type Instance } from '@popperjs/core'

/**
 * The element to attach the tooltip to.
 */

const props = defineProps<{
  element: any
}>()

/**
 * The tooltip root reference.
 */

const tooltip: Ref<HTMLElement | null> = ref(null)

/**
 * Whether the tooltip is visible.
 */

const visible: Ref<boolean> = ref(false)

/**
 * The popper instance.
 */

let popperInstance: Instance | null = null

/**
 * Watch the prop and attach handlers.
 */

watch(() => props.element, (newValue, oldValue) => {
  if (oldValue) {
    (oldValue.$el || oldValue).removeEventListener("mouseenter", showTooltip);
    (oldValue.$el || oldValue).removeEventListener("focus", showTooltip);
    (oldValue.$el || oldValue).removeEventListener("mouseleave", hideTooltip);
    (oldValue.$el || oldValue).removeEventListener("blur", hideTooltip);
    if (!popperInstance) {
      throw new Error("Can't be here, popper instance cannot be null")
    }
    popperInstance.destroy()
  }
  if (newValue) {
    (newValue.$el || newValue).addEventListener("mouseenter", showTooltip);
    (newValue.$el || newValue).addEventListener("focus", showTooltip);
    (newValue.$el || newValue).addEventListener("mouseleave", hideTooltip);
    (newValue.$el || newValue).addEventListener("blur", hideTooltip);
    if (!tooltip.value) {
      throw new Error("Can't be here, tooltip cannot be null")
    }
    popperInstance = createPopper(props.element.$el || props.element, tooltip.value, {
      placement: 'auto',
      modifiers: [{
        name: 'offset',
        options: {
          offset: [0, 8] // TODO: When popper appears vertically it would be [8, 0]
        }
      }]
    })
  }
})

function showTooltip() {
  if (!popperInstance) {
    throw new Error("Can't be here, popper instance cannot be null")
  }
  visible.value = true
  popperInstance.update()
}

function hideTooltip() {
  visible.value = false
}
</script>
