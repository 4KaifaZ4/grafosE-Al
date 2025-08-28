export class Graph {
    constructor() {
        this.vertices = [];
        this.edges = [];
        this.directed = false;
        this.weighted = false;
        this.nextVertexId = 1;
        this.nextEdgeId = 1;
    }
    
    addVertex(x, y) {
        const id = `v${this.nextVertexId++}`;
        const vertex = {
            id,
            x,
            y,
            label: id,
            color: '#6f42c1'
        };
        this.vertices.push(vertex);
        return vertex;
    }
    
    addEdge(sourceId, targetId, weight = 1) {
        // Validar que la arista no exista
        const edgeExists = this.edges.some(edge => 
            (edge.source === sourceId && edge.target === targetId) ||
            (!this.directed && edge.source === targetId && edge.target === sourceId)
        );
        
        if (edgeExists) return null;
        
        const id = `e${this.nextEdgeId++}`;
        const edge = {
            id,
            source: sourceId,
            target: targetId,
            directed: this.directed,
            weight: this.weighted ? weight : 1,
            label: this.weighted ? weight.toString() : ''
        };
        
        this.edges.push(edge);
        return edge;
    }
    
    removeVertex(vertexId) {
        this.vertices = this.vertices.filter(v => v.id !== vertexId);
        this.edges = this.edges.filter(e => e.source !== vertexId && e.target !== vertexId);
    }
    
    removeEdge(edgeId) {
        this.edges = this.edges.filter(e => e.id !== edgeId);
    }
    
    getVertex(vertexId) {
        return this.vertices.find(v => v.id === vertexId);
    }
    
    getEdge(edgeId) {
        return this.edges.find(e => e.id === edgeId);
    }
    
    updateEdgeWeight(edgeId, weight) {
        const edge = this.getEdge(edgeId);
        if (edge) {
            edge.weight = weight;
            edge.label = this.weighted ? weight.toString() : '';
            return true;
        }
        return false;
    }
    
    clear() {
        this.vertices = [];
        this.edges = [];
        this.nextVertexId = 1;
        this.nextEdgeId = 1;
    }
    
    getMetrics() {
        return {
            vertexCount: this.vertices.length,
            edgeCount: this.edges.length,
            graphType: this.directed ? (this.weighted ? 'Dirigido Ponderado' : 'Dirigido') : 
                      (this.weighted ? 'No Dirigido Ponderado' : 'No Dirigido')
        };
    }
    
    getAdjacencyMatrix() {
        const size = this.vertices.length;
        const matrix = Array(size).fill().map(() => Array(size).fill(0));
        
        // Mapear IDs de vértices a índices
        const vertexIndexMap = {};
        this.vertices.forEach((vertex, index) => {
            vertexIndexMap[vertex.id] = index;
        });
        
        // Llenar la matriz de adyacencia
        this.edges.forEach(edge => {
            const i = vertexIndexMap[edge.source];
            const j = vertexIndexMap[edge.target];
            
            if (i !== undefined && j !== undefined) {
                matrix[i][j] = this.weighted ? edge.weight : 1;
                
                if (!edge.directed) {
                    matrix[j][i] = this.weighted ? edge.weight : 1;
                }
            }
        });
        
        return matrix;
    }
}