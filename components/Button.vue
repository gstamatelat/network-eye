<template>
  <button :disabled="disabled" class="text-white font-medium rounded-lg text-sm focus:outline-none" :class="{
    'bg-blue-700 hover:bg-blue-800 focus:ring-blue-300': (!color || color == 'blue') && !disabled,
    'bg-red-700 hover:bg-red-800 focus:ring-red-300': (color == 'red') && !disabled,
    'bg-blue-400 cursor-not-allowed': (!color || color == 'blue') && disabled,
    'bg-red-400 cursor-not-allowed': (color == 'red') && disabled,
    'px-5 py-2.5': !icon
  }">
    <slot></slot>
  </button>
</template>

<script lang="ts" setup>
const props = defineProps<{
  color?: "blue" | "red"
  icon?: boolean
  disabled?: boolean
}>()
</script>
