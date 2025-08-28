/**
 * Operaciones avanzadas sobre grafos
 */

export class GraphOperations {
    constructor(graph) {
        this.graph = graph;
    }

    /**
     * Encuentra todos los vértices adyacentes a un vértice dado
     */
    getAdjacentVertices(vertexId) {
        const adjacent = new Set();
        
        this.graph.edges.forEach(edge => {
            if (edge.source === vertexId) {
                adjacent.add(edge.target);
            }
            if (!edge.directed && edge.target === vertexId) {
                adjacent.add(edge.source);
            }
        });
        
        return Array.from(adjacent);
    }

    /**
     * Calcula el grado de un vértice
     */
    getVertexDegree(vertexId) {
        let degree = 0;
        
        this.graph.edges.forEach(edge => {
            if (edge.source === vertexId) degree++;
            if (edge.target === vertexId) degree++;
            // Para grafos no dirigidos, evitar contar dos veces la misma arista
            if (!edge.directed && edge.source === vertexId && edge.target === vertexId) degree--;
        });
        
        return degree;
    }

    /**
     * Encuentra el camino más corto entre dos vértices (sin pesos)
     */
    findShortestPathBFS(startVertexId, endVertexId) {
        if (startVertexId === endVertexId) return [startVertexId];
        
        const visited = new Set([startVertexId]);
        const queue = [[startVertexId, [startVertexId]]];
        
        while (queue.length > 0) {
            const [currentVertexId, path] = queue.shift();
            
            const neighbors = this.getAdjacentVertices(currentVertexId);
            
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    if (neighbor === endVertexId) {
                        return [...path, neighbor];
                    }
                    
                    visited.add(neighbor);
                    queue.push([neighbor, [...path, neighbor]]);
                }
            }
        }
        
        return null; // No hay camino
    }

    /**
     * Verifica si el grafo está conectado
     */
    isConnected() {
        if (this.graph.vertices.length === 0) return true;
        
        const visited = new Set();
        const queue = [this.graph.vertices[0].id];
        visited.add(this.graph.vertices[0].id);
        
        while (queue.length > 0) {
            const currentVertexId = queue.shift();
            
            const neighbors = this.getAdjacentVertices(currentVertexId);
            
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            }
        }
        
        return visited.size === this.graph.vertices.length;
    }

    /**
     * Encuentra componentes conectados en el grafo
     */
    findConnectedComponents() {
        const components = [];
        const visited = new Set();
        
        for (const vertex of this.graph.vertices) {
            if (!visited.has(vertex.id)) {
                const component = [];
                const queue = [vertex.id];
                visited.add(vertex.id);
                component.push(vertex.id);
                
                while (queue.length > 0) {
                    const currentVertexId = queue.shift();
                    
                    const neighbors = this.getAdjacentVertices(currentVertexId);
                    
                    for (const neighbor of neighbors) {
                        if (!visited.has(neighbor)) {
                            visited.add(neighbor);
                            queue.push(neighbor);
                            component.push(neighbor);
                        }
                    }
                }
                
                components.push(component);
            }
        }
        
        return components;
    }

    /**
     * Encuentra puentes en el grafo (aristas cuya remoción desconecta el grafo)
     */
    findBridges() {
        const bridges = [];
        const originalEdges = [...this.graph.edges];
        
        for (const edge of originalEdges) {
            // Remover la arista temporalmente
            this.graph.edges = this.graph.edges.filter(e => e.id !== edge.id);
            
            // Verificar si el grafo sigue conectado
            const components = this.findConnectedComponents();
            
            if (components.length > 1) {
                bridges.push(edge);
            }
            
            // Restaurar la arista
            this.graph.edges = originalEdges;
        }
        
        return bridges;
    }

    /**
     * Encuentra puntos de articulación (vértices cuya remoción desconecta el grafo)
     */
    findArticulationPoints() {
        const articulationPoints = new Set();
        const originalVertices = [...this.graph.vertices];
        
        for (const vertex of originalVertices) {
            // Remover el vértice temporalmente
            this.graph.vertices = this.graph.vertices.filter(v => v.id !== vertex.id);
            this.graph.edges = this.graph.edges.filter(e => e.source !== vertex.id && e.target !== vertex.id);
            
            // Verificar si el grafo sigue conectado
            const components = this.findConnectedComponents();
            
            if (components.length > 1) {
                articulationPoints.add(vertex.id);
            }
            
            // Restaurar el vértice
            this.graph.vertices = originalVertices;
            this.graph.edges = originalEdges;
        }
        
        return Array.from(articulationPoints);
    }

    /**
     * Calcula el coeficiente de clustering de un vértice
     */
    calculateClusteringCoefficient(vertexId) {
        const neighbors = this.getAdjacentVertices(vertexId);
        const k = neighbors.length;
        
        if (k < 2) return 0;
        
        // Contar las aristas entre los vecinos
        let edgesBetweenNeighbors = 0;
        
        for (let i = 0; i < neighbors.length; i++) {
            for (let j = i + 1; j < neighbors.length; j++) {
                const hasEdge = this.graph.edges.some(edge => 
                    (edge.source === neighbors[i] && edge.target === neighbors[j]) ||
                    (!edge.directed && edge.source === neighbors[j] && edge.target === neighbors[i])
                );
                
                if (hasEdge) edgesBetweenNeighbors++;
            }
        }
        
        // El máximo número posible de aristas entre k vecinos es k*(k-1)/2
        const maxPossibleEdges = k * (k - 1) / 2;
        
        return edgesBetweenNeighbors / maxPossibleEdges;
    }

    /**
     * Calcula el coeficiente de clustering promedio del grafo
     */
    calculateAverageClusteringCoefficient() {
        if (this.graph.vertices.length === 0) return 0;
        
        let sum = 0;
        let count = 0;
        
        for (const vertex of this.graph.vertices) {
            const coefficient = this.calculateClusteringCoefficient(vertex.id);
            sum += coefficient;
            count++;
        }
        
        return sum / count;
    }
}