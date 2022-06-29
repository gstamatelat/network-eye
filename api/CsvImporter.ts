import * as Papa from 'papaparse'
import Graph, { DirectedGraph, UndirectedGraph } from 'graphology'

/**
 * Represents a CSV reader.
 */
export default class CsvImporter {
  private readonly _table?: string[][]
  private readonly _header?: string[]
  private readonly _parseError?: string
  private readonly _numRows?: number

  /**
   * Instantiate a new CsvImporter based on the given data.
   * 
   * @param data the data associated with this instance
   */
  constructor(data: ArrayBuffer) {
    // Decode
    const decoded: string = new TextDecoder().decode(data)
    // Check if binary
    if (decoded.match(/\ufffd/)) {
      this._parseError = "Input file appears to be binary"
      return
    }
    // Parse
    let parsed: string[][]
    const parseResults: Papa.ParseResult<string[]> = Papa.parse(decoded, {
      skipEmptyLines: true
    })
    if (parseResults.errors.length > 0) {
      this._parseError = "DSV Parsing Error: " +
        [...new Set(parseResults.errors.map((value: Papa.ParseError) => value.code))].join("; ") +
        " (check that input is in DSV format)"
      return
    } else if (parseResults.meta.truncated) {
      this._parseError = "DSV Parsing Error: Result was truncated"
      return
    } else if (parseResults.meta.aborted) {
      this._parseError = "DSV Parsing Error: Result was aborted"
      return
    } else {
      parsed = parseResults.data
    }
    // Check if input has more than one record
    if (parsed.length < 2) {
      this._parseError = "DSV is empty (contains zero or one rows)"
      return
    }
    // Trim
    for (let i = 0; i < parsed.length; i++) {
      for (let j = 0; j < parsed[i].length; j++) {
        parsed[i][j] = parsed[i][j].trim()
      }
    }
    // Check header
    if (new Set<string>(parsed[0]).size != parsed[0].length) {
      this._parseError = `The header cannot contain duplicates values: ${parsed[0]}`
      return
    }
    // Check rows
    let numRecords: number = -1
    for (let i = 0; i < parsed.length; i++) {
      if (parsed[i].length < 2) {
        this._parseError = `DSV Parsing Error: Each row much have at least 2 fields, found ${parsed[i].length}: ${parsed[i]}`
        return
      } else if (numRecords >= 0 && parsed[i].length != numRecords) {
        this._parseError = "DSV Parsing Error: The number of fields in all rows must be equal"
        return
      } else if (!parsed[i].every(v => v)) {
        this._parseError = "DSV Parsing Error: There are empty fields"
        return
      } else {
        numRecords = parsed[i].length
      }
    }
    // Set the table, header and numRows
    this._table = parsed.slice(1)
    this._header = parsed[0]
    this._numRows = parsed.length - 1
  }

  /**
   * Returns the header of the table.
   * 
   * @returns the header of the table
   */
  public header(): string[] {
    if (!this._header) {
      throw new Error("Can't be here, header is undefined")
    }
    return this._header.slice()
  }

  /**
   * Returns the number of rows in the table.
   * 
   * @returns the number of rows in the table
   */
  public numRows(): number {
    if (!this._numRows) {
      throw new Error("Can't be here, numRows is undefined")
    }
    return this._numRows
  }

  /**
   * Returns the parsing error or null if parsing was successful.
   * 
   * @returns the parsing error or null if parsing was successful
   */
  public parseError(): string | null {
    if (this._parseError) {
      return this._parseError
    } else {
      return null
    }
  }

  /**
   * Returns a tuple indicating whether the table associated with this instance can represent a directed graph and an undirected graph, in this order.
   * 
   * @param source the source column
   * @param target the target column
   * @returns the possibility of representation of the given table as a directed or undirected graph
   */
  public determine(source: number, target: number): [boolean, boolean] {
    if (!this._table) {
      throw new Error("Can't be here, table is undefined")
    }
    let directed = true
    let undirected = true
    const g: Record<string, Set<string>> = {}
    for (let i = 1; i < this._table.length; i++) {
      const u: string = this._table[i][source]
      const v: string = this._table[i][target]
      if (!(u in g)) {
        g[u] = new Set<string>()
      }
      if (!(v in g)) {
        g[v] = new Set<string>()
      }
      if (g[u].has(v)) {
        // parallel edge
        undirected = false
        directed = false
        break
      }
      if (g[v].has(u)) {
        // there exists an opposite edge, so can't be undirected
        undirected = false
      }
      g[u].add(v)
    }
    return [directed, undirected]
  }

  /**
   * Returns a slice of the parsed table.
   * 
   * @param start the start index (inclusive)
   * @param end the end index (exclusive)
   * @returns a slice of the parsed table deterined by the given range
   */
  public slice(start: number, end: number): string[][] {
    if (!this._table) {
      throw new Error("Can't be here, table is undefined")
    }
    return this._table.slice(start, end)
  }

  /**
   * Converts table associated with this instance into a Graph object.
   * 
   * @param source the source column
   * @param target the target column
   * @param directed whether to import as directed (or undirected)
   * @returns the graph object from the given string table
   */
  public import(source: number, target: number, directed: boolean): Graph {
    if (!this._table) {
      throw new Error("Can't be here, table is undefined")
    }
    if (!this._header) {
      throw new Error("Can't be here, header is undefined")
    }
    // Indices of the edge attributes
    const attrs: number[] = [...Array<number>(this._header.length).keys()].filter(x => x != source && x != target)
    // Create graph
    const g: Graph = directed ? new DirectedGraph() : new UndirectedGraph()
    for (let i = 0; i < this._table.length; i++) {
      // Get ends of edge
      const u: string = this._table[i][source]
      const v: string = this._table[i][target]
      // Add the nodes if needed
      if (!g.hasNode(u)) {
        g.addNode(u)
      }
      if (!g.hasNode(v)) {
        g.addNode(v)
      }
      // Get the other edge attributes
      const edgeAttrs: Record<string, string> = {}
      for (const x of attrs) {
        edgeAttrs[this._header[x]] = this._table[i][x]
      }
      // Add the edge
      g.addEdge(u, v, edgeAttrs)
    }
    return g
  }
}
