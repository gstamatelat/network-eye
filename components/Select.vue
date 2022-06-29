<template>
  <div ref="dropdownRoot" class="not-prose">
    <!-- Button -->
    <Button ref="buttonPart" @click="toggleDropdown" class="inline-flex items-center w-96 max-w-full">
      <span class="flex-auto block whitespace-nowrap text-ellipsis overflow-hidden">{{ selectedLabel }}</span>
      <svg class="flex-none w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
      </svg>
    </Button>
    <!-- Dropdown -->
    <div ref="dropdownPart" :class="{ hidden: !active }"
      class="z-10 bg-white divide-y divide-gray-100 rounded-lg border border-black/[.15] shadow dark:bg-gray-700 dark:divide-gray-600 absolute mt-1">
      <ul class="py-1 text-sm text-gray-700 dark:text-gray-200">
        <li v-for="link, i in items">
          <a @click="changeIndex(i)" :class="{ 'font-bold': index == i }"
            class="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white cursor-pointer whitespace-nowrap overflow-hidden text-ellipsis">
            {{ link }}
          </a>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Ref, ComputedRef } from 'vue'

/**
 * Definition of the items prop and index model.
 */

const props = defineProps<{
  items: Array<string>,
  index: number
}>()
const emit = defineEmits<{
  (e: 'update:index', index: number): void
}>()

/**
 * The HTML elements.
 */

const dropdownRoot: Ref<HTMLElement | null> = ref(null)
const buttonPart: Ref<any> = ref(null)
const dropdownPart: Ref<HTMLElement | null> = ref(null)

/**
 * The computed selectedLabel.
 */

const selectedLabel: ComputedRef<string> = computed(() => {
  if (props.index >= 0 && props.index < props.items.length) {
    return props.items[props.index]
  } else {
    return "--"
  }
})

/**
 * Whether the dropdown is visible.
 */

const active: Ref<boolean> = ref(false)

/**
 * Functions that change the visibility of the dropdown.
 */

function showDropdown() {
  active.value = true
  dropdownPart.value!.style.width = buttonPart.value!.$el.clientWidth.toString() + "px"
}
function hideDropdown() {
  active.value = false
}
function toggleDropdown() {
  if (active.value) {
    hideDropdown()
  } else {
    showDropdown()
  }
}

/**
 * The changeIndex function.
 */

function changeIndex(index: number) {
  hideDropdown()
  emit("update:index", index)
}

/**
 * Close dropdown when user clicks outside the dropdown area.
 */

function clickOutsideEvent(this: Window, ev: MouseEvent) {
  if (!dropdownRoot.value!.contains(ev.target as HTMLElement)) {
    hideDropdown()
  }
}
onMounted(() => {
  window.addEventListener("mouseup", clickOutsideEvent)
})
onUnmounted(() => {
  window.removeEventListener("mouseup", clickOutsideEvent)
})
</script>
