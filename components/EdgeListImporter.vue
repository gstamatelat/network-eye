<template>
  <div>
    <div v-if="error">
      <ErrorMessage>{{ error }}</ErrorMessage>
    </div>
    <div v-else-if="parsing">
      <Spinner class="flex place-content-center"></Spinner>
    </div>
    <div v-else>
      <div v-if="numOfRows > config.paginationSize" class="flex items-center text-center mb-2">
        <Button @click="pagination = 0" icon :disabled="pagination <= 0" class="p-1.5 mr-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </Button>
        <Button @click="pagination--" icon :disabled="pagination <= 0" class="p-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </Button>
        <span class="flex-auto mr-1">
          Rows
          {{ pagination * config.paginationSize + 1 }}
          to
          {{ Math.min((pagination + 1) * config.paginationSize, numOfRows) }}
        </span>
        <Button @click="pagination++" icon :disabled="pagination >= paginationLast" class="p-1.5 mr-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </Button>
        <Button @click="pagination = paginationLast" icon :disabled="pagination >= paginationLast" class="p-1.5">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </Button>
      </div>
      <div class="not-prose relative overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead class="text-xs uppercase bg-gray-50 dark:bg-gray-700">
            <tr>
              <th v-for="label, index in header" class="px-6 py-3 border">
                {{ label }}
                <span v-if="index == source">
                  [S]
                  <A @click="[source, target] = [target, source]">&lt;-&gt;</A>
                </span>
                <span v-else-if="index == target">
                  [T]
                  <A @click="[source, target] = [target, source]">&lt;-&gt;</A>
                </span>
                <span v-else>
                  <A @click="source = index">[S]</A>
                  <A @click="target = index">[T]</A>
                </span>
              </th>
            </tr>
          </thead>
          <tbody class="text-sm">
            <tr v-for="row in slicedTable" class="bg-white dark:bg-gray-800 dark:border-gray-700">
              <td v-for="cell in row" class="px-6 py-4 font-medium whitespace-nowrap border">
                {{ cell }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mt-4">
        <span v-if="graphType[0]">
          <Spinner></Spinner>
        </span>
        <div v-if="!graphType[0] && (graphType[1] || graphType[2])" class="flex gap-2 flex-col sm:flex-row">
          <span v-if="graphType[1]">
            <Button class="w-full sm:w-auto" @click="importDirected">Import Directed</Button>
          </span>
          <span v-if="graphType[2]">
            <Button class="w-full sm:w-auto" @click="importUndirected">Import Undirected</Button>
          </span>
        </div>
        <span v-if="!graphType[0] && !graphType[1] && !graphType[2]">
          <ErrorMessage>
            The represenation is a multigraph because it contains parallel edges. It cannot be imported.
          </ErrorMessage>
        </span>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ComputedRef, Ref } from 'vue'
import config from '~/app.config'
import API from '~/api/API'
import ClientGraph from '~/custom/ClientGraph'

/**
 * The input property and import emit.
 */

const props = defineProps<{
  input: number
}>()
const emit = defineEmits<{
  (e: 'import'): void
}>()

/**
 * The API and state.
 */

const api: Ref<API> = useState('api')
const graphs: Ref<ClientGraph[]> = useState('graphs', () => [] as ClientGraph[])
const queue: Ref<string[]> = useState('queue', () => [] as string[])

/**
 * The table source and target.
 */

const source: Ref<number> = ref(0)
const target: Ref<number> = ref(1)

/**
 * The parse logic.
 */

const error: Ref<string | null> = ref(null)
const header: Ref<string[] | null> = ref(null)
const numOfRows: Ref<number> = ref(-1)
const parsing: Ref<boolean> = ref(false)
watchEffect(async (onCleanup) => {
  let running: boolean = true
  onCleanup(() => { running = false })
  error.value = null
  header.value = null
  numOfRows.value = -1
  parsing.value = true
  const [_header, _error, _numOfRows] = await api.value.csvParse(props.input)
  if (running) {
    error.value = _error
    header.value = _header
    numOfRows.value = _numOfRows
    parsing.value = false
  }
})

/**
 * The determine logic. Has 3 boolean values: determining, directed and undirected.
 */

const graphType: Ref<[boolean, boolean, boolean]> = ref(
  [false, false, false] as [boolean, boolean, boolean]
)
watchEffect(async (onCleanup) => {
  let running: boolean = true
  onCleanup(() => { running = false })
  graphType.value = [true, false, false]
  const _determine: [boolean, boolean] = await api.value.csvDetermine(props.input, source.value, target.value)
  if (running) {
    graphType.value = [false, _determine[0], _determine[1]]
  }
})

/**
 * The slice logic.
 */

const slicedTable: Ref<string[][]> = ref([[]])
const pagination: Ref<number> = ref(0)
const paginationLast: ComputedRef<number> = computed(() => {
  if (!error.value) {
    return Math.ceil(numOfRows.value / config.paginationSize) - 1
  } else {
    return 0
  }
})
watchEffect(async (onCleanup) => {
  let running: boolean = true
  onCleanup(() => { running = false })
  const _slicedTable: string[][] = await api.value.csvSlice(
    props.input,
    pagination.value * config.paginationSize,
    pagination.value * config.paginationSize + config.paginationSize
  )
  if (running) {
    slicedTable.value = _slicedTable
  }
})

/**
 * Import as directed graph.
 */

async function importDirected() {
  api.value.csvImport(props.input, source.value, target.value, true)
  emit('import')
}

/**
 * Import as undirected graph.
 */

async function importUndirected() {
  api.value.csvImport(props.input, source.value, target.value, false)
  emit('import')
}
</script>
