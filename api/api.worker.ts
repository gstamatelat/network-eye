import * as Comlink from 'comlink'
import Graph from 'graphology'
import ClientGraph from '~/custom/ClientGraph'
import CsvImporter from './CsvImporter'
import API from './API'

export default interface GraphSource {
  readonly name: string
  readonly content: Promise<ArrayBuffer>
}

class APIImpl implements API {
  private readonly queue: GraphSource[]
  private readonly graphs: Graph[]
  private csvImporter?: CsvImporter
  private csvImporterIndex?: number
  private graphChangedCallback: () => void

  /**
   * Constuct a new API instance.
   */
  constructor() {
    this.queue = []
    this.graphs = []
    this.graphChangedCallback = function () { }
  }

  /**
   * Add a file to the queue.
   * 
   * @param s the file to add
   * @param name the name of the resource
   */
  public async queueAddFile(s: File, name?: string) {
    this.queue.push({
      name: name || s.name,
      content: new Promise<ArrayBuffer>((resolve, reject) => {
        s.arrayBuffer()
          .then((value: ArrayBuffer) => {
            if (value) {
              resolve(value)
            } else {
              reject("empty file or directory")
            }
          })
          .catch((reason: any) => {
            reject(reason)
          })
      })
    })
  }

  /**
   * Add a URL to the queue.
   * 
   * @param u the URL to add
   * @param name the name of the resource
   */
  public async queueAddURL(u: string, name?: string) {
    const s: URL = new URL(u)
    this.queue.push({
      name: name || u,
      content: new Promise<ArrayBuffer>((resolve, reject) => {
        fetch(s)
          .then((value: Response) => {
            if (value.status == 200) {
              value.arrayBuffer()
                .then((content: ArrayBuffer) => {
                  resolve(content)
                })
                .catch((reason: any) => {
                  reject(reason)
                })
            } else {
              reject(value.status.toString())
            }
          })
          .catch((reason: any) => {
            reject(reason)
          })
      })
    })
  }

  /**
   * Remove the queue item at the given index.
   * 
   * @param index the index to remove from the queue
   */
  public async queueRemove(index: number) {
    this.queue.splice(index, 1)
    this.csvImporter = undefined
    this.csvImporterIndex = undefined
  }

  /**
   * Returns the length of the queue.
   * 
   * @returns the length of the queue
   */
  public async queueLength(): Promise<number> {
    return this.queue.length
  }

  /**
   * Returns the name of the source corresponding to the given index.
   * 
   * @param index the index of the source
   * @returns the name of the source corresponding to the given index
   */
  public async queueName(index: number): Promise<string> {
    return this.queue[index].name
  }

  /**
   * Returns the size in bytes of the given source in the queue.
   * 
   * @param index the index of the source
   * @returns the size in bytes of the given source in the queue
   */
  public async queueSize(index: number): Promise<number | null> {
    let content: ArrayBuffer
    try {
      content = await this.queue[index].content
    } catch (e) {
      return null
    }
    return content.byteLength
  }

  /**
   * Returns the error associated with a source, or null if there is no error.
   * 
   * @param index the index of the source
   * @returns the error associated with a source
   */
  public async queueError(index: number): Promise<any> {
    try {
      await this.queue[index].content
      return null
    } catch (e) {
      return e
    }
  }

  /**
   * Parse the given queue index as a CSV format.
   * 
   * This method must be called before invoking the methods csvDetermine and csvImport.
   * 
   * @param index the queue index
   * @returns the header, the error, and the number of rows as a tuple
   */
  public async csvParse(index: number): Promise<[string[] | null, string | null, number]> {
    if (index !== this.csvImporterIndex) {
      const data: ArrayBuffer = await this.queue[index].content
      this.csvImporter = new CsvImporter(data)
      this.csvImporterIndex = index
    }
    if (!this.csvImporter) {
      throw new Error("Can't be here, csvImporter is undefined")
    }
    return [this.csvImporter.header(), this.csvImporter.parseError(), this.csvImporter.numRows()]
  }

  /**
   * Returns a portion of the table for a given input source in the queue.
   * 
   * @param index the index of the source in the queue
   * @param start the start of the portion (inclusive)
   * @param end the end of the portion (exclusive)
   * @returns the portion dictated by start and end
   */
  public async csvSlice(index: number, start: number, end: number): Promise<string[][]> {
    if (!this.csvImporter) {
      throw new Error("Can't be here, csvImporter cannot be undefined")
    }
    if (index != this.csvImporterIndex) {
      throw new Error("Can't be here, csvImporterIndex cannot be undefined")
    }
    return this.csvImporter.slice(start, end)
  }

  /**
   * Returns a tuple indicating whether the given queue item can be imported as directed and undirected graph.
   * 
   * @param index the queue index
   * @param source the source column index
   * @param target the target column index
   * @returns a tuple indicating whether the given queue item can be imported as directed and undirected graph
   */
  public async csvDetermine(index: number, source: number, target: number): Promise<[boolean, boolean]> {
    if (!this.csvImporter) {
      throw new Error("Can't be here, csvImporter cannot be undefined")
    }
    if (index != this.csvImporterIndex) {
      throw new Error("Can't be here, csvImporterIndex cannot be undefined")
    }
    return this.csvImporter?.determine(source, target)
  }

  /**
   * Imports the given queue item to a Graph object and pushes it in the graphs instance variable.
   * 
   * @param index the queue index
   * @param source the source column
   * @param target the target column
   * @param directed whether to import the given queue item as directed graph (or undirected)
   */
  public async csvImport(index: number, source: number, target: number, directed: boolean) {
    if (!this.csvImporter) {
      throw new Error("Can't be here, csvImporter cannot be undefined")
    }
    if (index != this.csvImporterIndex) {
      throw new Error("Can't be here, csvImporterIndex cannot be undefined")
    }
    const g: Graph = this.csvImporter.import(source, target, directed)
    g.setAttribute("name", this.queue[index].name)
    this.graphs.push(g)
    this.graphChangedCallback()
  }

  /**
   * Set a callback function to be called when any change to any graph happens.
   * 
   * @param callback the graph changed callback
   */
  public async setGraphChangedCallback(callback: () => void) {
    this.graphChangedCallback = callback
  }

  /**
   * Returns the number of imported graphs.
   * 
   * @returns the number of graphs
   */
  public async numGraphs(): Promise<number> {
    return this.graphs.length
  }

  /**
   * Returns the ClientGraph object corresponding to the graph with the given index.
   * 
   * @param index the index of the graph
   * @returns the ClientGraph object of the graph with the given index
   */
  public async clientGraph(index: number): Promise<ClientGraph> {
    return {
      name: this.graphs[index].getAttribute("name"),
      order: this.graphs[index].order,
      size: this.graphs[index].size,
      directed: this.graphs[index].type == 'directed'
    }
  }

  /**
   * Removes a graph from the imported graphs.
   * 
   * @param index the index to remove
   */
  public async removeGraph(index: number): Promise<void> {
    this.graphs.splice(index, 1)
    this.graphChangedCallback()
  }

  /**
   * Returns the degree distribution of the given graph.
   * 
   * @param index the index of the graph
   * @param type the type of degree (in, out or undirected)
   * @returns the degree distribution of the given graph
   */
  public async degreeDistribution(index: number, type: 'in' | 'out' | 'undirected'): Promise<Map<number, number>> {
    if (index >= this.graphs.length) {
      throw new Error(`Index ${index} is outside the bounds of array with length ${this.graphs.length}`)
    }
    const g: Graph = this.graphs[index]
    if (type == 'undirected' && g.type !== 'undirected') {
      throw new Error(`Can't be here, graph must be undirected, got ${type}, graph is ${g.type}`)
    }
    if ((type == 'in' || type == 'out') && g.type !== 'directed') {
      throw new Error("Can't be here, graph must be directed")
    }
    const dd: Map<number, number> = new Map()
    this.graphs[index].forEachNode(x => {
      let degree: number = -1
      if (type == 'in') {
        degree = g.inDegree(x)
      } else if (type == 'out') {
        degree = g.outDegree(x)
      } else if (type == 'undirected') {
        degree = g.degree(x)
      } else {
        throw new Error("Can't be here, type must be one of in, out or undirected")
      }
      if (!dd.has(degree)) {
        dd.set(degree, 0)
      }
      dd.set(degree, dd.get(degree)! + 1)
    })
    return dd
  }
}

Comlink.expose(APIImpl)
