<template>
  <a @click="emit('click')" class="text-blue-600 dark:text-blue-500 hover:underline cursor-pointer">
    <slot></slot>
  </a>
</template>

<script lang="ts" setup>
const emit = defineEmits<{
  (e: 'click'): void
}>()
</script>
