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
        // Validar coordenadas
        if (typeof x !== 'number' || typeof y !== 'number' || 
            isNaN(x) || isNaN(y) || !isFinite(x) || !isFinite(y)) {
            console.error('Coordenadas inválidas para el vértice');
            return null;
        }
        
        // Validar que las coordenadas estén dentro del canvas
        if (x < 0 || y < 0 || x > 1000 || y > 600) {
            console.error('Las coordenadas del vértice están fuera del rango permitido');
            return null;
        }
        
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
        // Validar IDs de vértices
        if (!this.getVertex(sourceId) || !this.getVertex(targetId)) {
            console.error('Vértices inválidos para la arista');
            return null;
        }
        
        // Validar peso
        if (this.weighted && (typeof weight !== 'number' || isNaN(weight) || !isFinite(weight) || weight <= 0)) {
            console.error('Peso inválido para la arista');
            return null;
        }
        
        // Validar que la arista no exista (solo para grafos no dirigidos)
        const edgeExists = this.edges.some(edge => {
            if (this.directed) {
                // Para grafos dirigidos: misma dirección = mismo source y target
                return edge.source === sourceId && edge.target === targetId;
            } else {
                // Para grafos no dirigidos: cualquier dirección entre los mismos nodos
                return (edge.source === sourceId && edge.target === targetId) ||
                       (edge.source === targetId && edge.target === sourceId);
            }
        });
        
        if (edgeExists && sourceId !== targetId) {
            console.error('La arista ya existe');
            return null;
        }
        
        const id = `e${this.nextEdgeId++}`;
        const edge = {
            id,
            source: sourceId,
            target: targetId,
            directed: this.directed,
            weight: this.weighted ? Math.max(1, Math.floor(weight)) : 1,
            label: this.weighted ? Math.max(1, Math.floor(weight)).toString() : ''
        };
        
        this.edges.push(edge);
        return edge;
    }
    
    removeVertex(vertexId) {
        // Validar ID del vértice
        if (!this.getVertex(vertexId)) {
            console.error('Vértice no encontrado');
            return false;
        }
        
        this.vertices = this.vertices.filter(v => v.id !== vertexId);
        this.edges = this.edges.filter(e => e.source !== vertexId && e.target !== vertexId);
        return true;
    }
    
    removeEdge(edgeId) {
        // Validar ID de la arista
        if (!this.getEdge(edgeId)) {
            console.error('Arista no encontrada');
            return false;
        }
        
        this.edges = this.edges.filter(e => e.id !== edgeId);
        return true;
    }
    
    getVertex(vertexId) {
        return this.vertices.find(v => v.id === vertexId);
    }
    
    getEdge(edgeId) {
        return this.edges.find(e => e.id === edgeId);
    }
    
    updateEdgeWeight(edgeId, weight) {
        // Validar peso
        if (typeof weight !== 'number' || isNaN(weight) || !isFinite(weight) || weight <= 0) {
            console.error('Peso inválido');
            return false;
        }
        
        const edge = this.getEdge(edgeId);
        if (edge) {
            edge.weight = Math.max(1, Math.floor(weight));
            edge.label = this.weighted ? edge.weight.toString() : '';
            return true;
        }
        return false;
    }
    
    updateEdgeDirection(edgeId, directed) {
        const edge = this.getEdge(edgeId);
        if (edge) {
            // Solo permitir cambiar dirección si es consistente con la configuración del grafo
            if (edge.directed !== directed) {
                // Verificar si ya existe una arista en la dirección opuesta
                const oppositeEdgeExists = this.edges.some(e => 
                    e.source === edge.target && e.target === edge.source && e.id !== edgeId
                );
                
                if (oppositeEdgeExists && !this.directed) {
                    console.error('Ya existe una arista en la dirección opuesta');
                    return false;
                }
                
                edge.directed = directed;
                return true;
            }
        }
        return false;
    }
    
    clear() {
        this.vertices = [];
        this.edges = [];
        this.nextVertexId = 1;
        this.nextEdgeId = 1;
        return true;
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
                if (this.directed) {
                    // Grafo dirigido: solo llenar la posición i,j
                    matrix[i][j] = this.weighted ? edge.weight : 1;
                } else {
                    // Grafo no dirigido: llenar ambas posiciones (matriz simétrica)
                    matrix[i][j] = this.weighted ? edge.weight : 1;
                    matrix[j][i] = this.weighted ? edge.weight : 1;
                }
            }
        });
        
        return matrix;
    }
    
    // Cambiar el tipo de dirección de todas las aristas
    setGraphDirection(directed) {
        this.directed = directed;
        // Actualizar la dirección de todas las aristas existentes
        this.edges.forEach(edge => {
            edge.directed = directed;
        });
        return true;
    }
}