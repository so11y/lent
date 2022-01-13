import { viteHttpInstance } from "./types";

export const depends = (): viteHttpInstance["depend"] => {
    const dependGraph = new Map<string, Set<string>>();
    return {
        getGraph: () => dependGraph,
        getDepend: (fileName: string) => (dependGraph.get(fileName)),
        addDepend(fileName: string, childFileName: string) {
            if (dependGraph.has(fileName)) {
                dependGraph.get(fileName).add(childFileName)
            } else {
                dependGraph.set(fileName, new Set([childFileName]))
            }
        }
    }
}