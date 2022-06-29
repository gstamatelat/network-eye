<template>
  <div v-if="degreeDistribution">
    <div class="flex justify-center">
      <Select v-if="currentGraph?.directed" :items="dropdownLabels" v-model:index="dropdownIndex"></Select>
    </div>
    <div>
      <Scatter v-if="degreeDistribution" :chart-options="chartOptions" :chart-data="chartData" dataset-id-key="label"
        :width="400" :height="400" />
    </div>
  </div>
  <div v-else>
    <Spinner></Spinner>
  </div>
</template>

<script lang="ts" setup>
import { Ref, ComputedRef } from 'vue'
import { Scatter } from 'vue-chartjs'
import { Chart, registerables } from 'chart.js'
import API from '~/api/API'
import ClientGraph from '~/custom/ClientGraph'

Chart.register(...registerables)

/**
 * The index prop.
 */

const props = defineProps<{
  index: number
}>()

/**
 * The dropdown data.
 */

const dropdownIndex: Ref<number> = ref(0)
const dropdownLabels: Ref<string[]> = ref(['In Degree', 'Out Degree'])
const dropdownValues: Ref<string[]> = ref(['in', 'out'])
const degreeMode: ComputedRef<'in' | 'out'> = computed(() => {
  const val = dropdownValues.value[dropdownIndex.value]
  if (val == 'in') {
    return 'in'
  } else if (val == 'out') {
    return 'out'
  } else {
    throw new Error("Can't be here, val must be in or out")
  }
})

/**
 * API and state.
 */

const api: Ref<API> = useState('api')
const graphs: Ref<ClientGraph[]> = useState('graphs', () => [] as ClientGraph[])

/**
 * The current ClientGraph.
 */

const currentGraph: ComputedRef<ClientGraph | null> = computed(() => {
  if (props.index < graphs.value.length) {
    return graphs.value[props.index]
  } else {
    return null
  }
})

/**
 * Degree distribution.
 */

const degreeDistribution: Ref<{ x: number, y: number }[] | null> = ref(null)
watchEffect(async () => {
  degreeDistribution.value = null
  if (currentGraph.value) {
    const direction = currentGraph.value.directed ? degreeMode.value : 'undirected'
    const degreeDistributionNew: { x: number, y: number }[] = []
    const dd: Map<number, number> = await api.value.degreeDistribution(props.index, direction)
    for (const [k, v] of dd) {
      degreeDistributionNew.push({ x: k, y: v })
    }
    degreeDistribution.value = degreeDistributionNew
  }
})

/**
 * Chart data and options.
 */

const chartData = computed(() => {
  return {
    datasets: [{
      label: 'Degree Distribution',
      data: degreeDistribution.value,
      borderColor: '#1d4fd8',
      backgroundColor: '#1d4fd8'
    }]
  }
})

const chartOptions = {
  responsive: true,
  scales: {
    x: {
      title: {
        display: true,
        text: 'Degree',
      },
      type: 'logarithmic'
    },
    y: {
      title: {
        display: true,
        text: '# of Nodes'
      },
      type: 'logarithmic'
    }
  }
}
</script> 
