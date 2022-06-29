<template>
  <div class="z-20 fixed inset-0 backdrop-grayscale">
    <div
      class="fixed top-0 left-0 right-0 sm:top-5 sm:left-5 sm:right-5 sm:shadow-lg sm:rounded-lg bg-gray-900 opacity-95 px-12 py-10 prose prose-invert max-w-full">
      <template v-for="helpItem, index in help.items">
        <h2 v-html="helpItem.title"></h2>
        <p v-html="helpItem.body"></p>
        <A @click="help.removeIndex(index)">Close</A>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
const help = useHelp()
</script>
