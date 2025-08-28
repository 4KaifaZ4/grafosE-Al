/**
 * Algoritmos de camino más corto
 */

export class ShortestPath {
    constructor(graph) {
        this.graph = graph;
    }

    /**
     * Algoritmo de Dijkstra para encontrar el camino más corto
     */
    dijkstra(startVertexId, endVertexId = null) {
        const distances = {};
        const previous = {};
        const unvisited = new Set();
        
        // Inicializar distancias
        this.graph.vertices.forEach(vertex => {
            distances[vertex.id] = vertex.id === startVertexId ? 0 : Infinity;
            previous[vertex.id] = null;
            unvisited.add(vertex.id);
        });
        
        while (unvisited.size > 0) {
            // Encontrar el vértice no visitado con la menor distancia
            let currentVertexId = null;
            let minDistance = Infinity;
            
            for (const vertexId of unvisited) {
                if (distances[vertexId] < minDistance) {
                    minDistance = distances[vertexId];
                    currentVertexId = vertexId;
                }
            }
            
            if (currentVertexId === null || minDistance === Infinity) {
                break;
            }
            
            // Si encontramos el vértice destino, podemos terminar temprano
            if (endVertexId && currentVertexId === endVertexId) {
                break;
            }
            
            unvisited.delete(currentVertexId);
            
            // Actualizar distancias a los vecinos
            const neighbors = this.getNeighborsWithWeights(currentVertexId);
            
            for (const { vertexId, weight } of neighbors) {
                if (unvisited.has(vertexId)) {
                    const alt = distances[currentVertexId] + weight;
                    
                    if (alt < distances[vertexId]) {
                        distances[vertexId] = alt;
                        previous[vertexId] = currentVertexId;
                    }
                }
            }
        }
        
        return { distances, previous };
    }

    /**
     * Reconstruye el camino más corto desde startVertexId hasta endVertexId
     */
    getShortestPath(startVertexId, endVertexId) {
        const { previous } = this.dijkstra(startVertexId, endVertexId);
        
        const path = [];
        let currentVertexId = endVertexId;
        
        while (currentVertexId !== null) {
            path.unshift(currentVertexId);
            currentVertexId = previous[currentVertexId];
            
            // Prevenir bucles infinitos
            if (path.length > this.graph.vertices.length) {
                return null;
            }
        }
        
        // Verificar si encontramos un camino válido
        if (path[0] !== startVertexId) {
            return null;
        }
        
        return path;
    }

    /**
     * Algoritmo de Bellman-Ford para grafos con pesos negativos
     */
    bellmanFord(startVertexId) {
        const distances = {};
        const previous = {};
        
        // Inicializar distancias
        this.graph.vertices.forEach(vertex => {
            distances[vertex.id] = vertex.id === startVertexId ? 0 : Infinity;
            previous[vertex.id] = null;
        });
        
        // Relajar todas las aristas |V| - 1 veces
        for (let i = 0; i < this.graph.vertices.length - 1; i++) {
            let updated = false;
            
            for (const edge of this.graph.edges) {
                if (distances[edge.source] + edge.weight < distances[edge.target]) {
                    distances[edge.target] = distances[edge.source] + edge.weight;
                    previous[edge.target] = edge.source;
                    updated = true;
                }
                
                // Para grafos no dirigidos, considerar la arista en ambas direcciones
                if (!edge.directed && distances[edge.target] + edge.weight < distances[edge.source]) {
                    distances[edge.source] = distances[edge.target] + edge.weight;
                    previous[edge.source] = edge.target;
                    updated = true;
                }
            }
            
            // Si no hubo cambios, podemos terminar temprano
            if (!updated) {
                break;
            }
        }
        
        // Verificar ciclos de peso negativo
        for (const edge of this.graph.edges) {
            if (distances[edge.source] + edge.weight < distances[edge.target]) {
                throw new Error("El grafo contiene un ciclo de peso negativo");
            }
            
            if (!edge.directed && distances[edge.target] + edge.weight < distances[edge.source]) {
                throw new Error("El grafo contiene un ciclo de peso negativo");
            }
        }
        
        return { distances, previous };
    }

    /**
     * Algoritmo de Floyd-Warshall para todas las parejas de caminos más cortos
     */
    floydWarshall() {
        const size = this.graph.vertices.length;
        const dist = Array(size).fill().map(() => Array(size).fill(Infinity));
        const next = Array(size).fill().map(() => Array(size).fill(null));
        
        // Inicializar matriz de distancias
        for (let i = 0; i < size; i++) {
            dist[i][i] = 0;
        }
        
        // Mapear IDs de vértices a índices
        const vertexIndexMap = {};
        this.graph.vertices.forEach((vertex, index) => {
            vertexIndexMap[vertex.id] = index;
        });
        
        // Llenar con los pesos de las aristas directas
        this.graph.edges.forEach(edge => {
            const i = vertexIndexMap[edge.source];
            const j = vertexIndexMap[edge.target];
            
            if (i !== undefined && j !== undefined) {
                dist[i][j] = edge.weight;
                next[i][j] = j;
                
                if (!edge.directed) {
                    dist[j][i] = edge.weight;
                    next[j][i] = i;
                }
            }
        });
        
        // Algoritmo de Floyd-Warshall
        for (let k = 0; k < size; k++) {
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    if (dist[i][k] + dist[k][j] < dist[i][j]) {
                        dist[i][j] = dist[i][k] + dist[k][j];
                        next[i][j] = next[i][k];
                    }
                }
            }
        }
        
        return { dist, next, vertexIndexMap };
    }

    /**
     * Reconstruye el camino desde i hasta j usando la matriz next de Floyd-Warshall
     */
    reconstructPath(i, j, next, vertexIndexMap) {
        if (next[i][j] === null) {
            return [];
        }
        
        const path = [this.graph.vertices[i].id];
        let current = i;
        
        while (current !== j) {
            current = next[current][j];
            path.push(this.graph.vertices[current].id);
        }
        
        return path;
    }

    /**
     * Obtiene vecinos con pesos
     */
    getNeighborsWithWeights(vertexId) {
        const neighbors = [];
        
        this.graph.edges.forEach(edge => {
            if (edge.source === vertexId) {
                neighbors.push({ vertexId: edge.target, weight: edge.weight });
            }
            
            if (!edge.directed && edge.target === vertexId) {
                neighbors.push({ vertexId: edge.source, weight: edge.weight });
            }
        });
        
        return neighbors;
    }

    /**
     * Encuentra el centro del grafo (vértice con mínima excentricidad)
     */
    findGraphCenter() {
        const { dist } = this.floydWarshall();
        const size = dist.length;
        
        if (size === 0) return null;
        
        // Calcular excentricidad de cada vértice
        const eccentricities = [];
        for (let i = 0; i < size; i++) {
            let maxDistance = 0;
            for (let j = 0; j < size; j++) {
                if (dist[i][j] > maxDistance && dist[i][j] !== Infinity) {
                    maxDistance = dist[i][j];
                }
            }
            eccentricities.push(maxDistance);
        }
        
        // Encontrar el vértice con mínima excentricidad
        let minEccentricity = Infinity;
        let centerVertexIndex = 0;
        
        for (let i = 0; i < size; i++) {
            if (eccentricities[i] < minEccentricity) {
                minEccentricity = eccentricities[i];
                centerVertexIndex = i;
            }
        }
        
        return this.graph.vertices[centerVertexIndex].id;
    }
}