<template>
  <div class="prose prose-slate dark:prose-invert max-w-5xl mx-auto p-4 sm:p-10">
    <template v-for="error, index in errors">
      <h1 class="text-red-700">{{ error?.name }}</h1>
      <h2 class="text-red-700">{{ error?.message }}</h2>
      <p v-if="error?.cause">{{ error.cause }}</p>
      <pre>{{ error?.stack }}</pre>
      <Button @click="errors.splice(index, 1)" class="mr-2">Dismiss</Button>
      <hr v-if="index != errors.length - 1">
    </template>
  </div>
</template>

<script lang="ts" setup>
const errors = useState('errors', () => [] as Error[])
</script>
