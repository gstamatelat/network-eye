const presetGraphs = [
    {
        name: "Les Misérables",
        url: "../assets/les-miserables.edges",
        description: "Coappearance network of characters in the novel <i>Les Misérables</i>, compiled by Donald Knuth."
    },
    {
        name: "Zachary's karate club",
        url: "../assets/karate-club.edges",
        description: "Social network of a university karate club, described in the paper <i>An Information Flow Model for Conflict and Fission in Small Groups</i> by Wayne W. Zachary. Node 1 is the instructor and node 34 is the club administrator."
    },
    {
        name: "Game of Thrones",
        url: "../assets/game-of-thrones.edges",
        description: "Character interaction network for George R. R. Martin's <i>A Song of Ice and Fire</i> saga, compiled by Andrew Beveridge."
    }
]

export const usePresetGraphs = () => { return presetGraphs }
