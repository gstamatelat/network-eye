<template>
  <div class="prose prose-slate dark:prose-invert max-w-xl mx-auto px-4 py-4">
    <Button icon class="fixed top-2 left-2 p-1.5">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
      </svg>
    </Button>
    <h2>List of imported files</h2>
    <div v-if="graphs.length == 0">
      <Spinner></Spinner>
    </div>
    <div v-else>
      <template v-for="g, index in graphs">
        <h4>{{ g.name }} ({{ g.directed ? 'directed' : 'undirected' }}) <A @click="api.removeGraph(index)">Remove</A>
        </h4>
        <p class="ml-5">
          V = {{ g.order }},
          E = {{ g.size }}
        </p>
        <DegreeDistribution :index="index"></DegreeDistribution>
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { Ref } from 'vue'
import ClientGraph from '~/custom/ClientGraph'
import API from '~/api/API'

/**
 * API and state.
 */

const api: Ref<API> = useState('api')
const graphs: Ref<ClientGraph[]> = useState('graphs', () => [] as ClientGraph[])
</script>
