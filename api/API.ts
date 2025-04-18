import type ClientGraph from "~/custom/ClientGraph"

/**
 * The web worker API interface.
 */
export default interface API {
  queueAddFile: (s: File, name?: string) => Promise<void>
  queueAddURL: (u: string, name?: string) => Promise<void>
  queueRemove: (index: number) => Promise<void>
  queueLength: () => Promise<number>
  queueName: (index: number) => Promise<string>
  queueSize: (index: number) => Promise<number | null>
  queueError: (index: number) => Promise<any>
  csvParse: (index: number) => Promise<[string[] | null, string | null, number]>
  csvSlice: (index: number, start: number, end: number) => Promise<string[][]>
  csvDetermine: (index: number, source: number, target: number) => Promise<[boolean, boolean]>
  csvImport: (index: number, source: number, target: number, directed: boolean) => Promise<void>
  setGraphChangedCallback: (callback: () => void) => Promise<void>
  numGraphs: () => Promise<number>
  clientGraph: (index: number) => Promise<ClientGraph>
  removeGraph: (index: number) => Promise<void>
  degreeDistribution: (index: number, type: 'in' | 'out' | 'undirected') => Promise<Map<number, number>>
}
