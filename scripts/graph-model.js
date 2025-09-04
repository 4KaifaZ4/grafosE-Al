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
            color: '#6f42c1',
            radius: 20 // Radio inicial, se ajustará según el texto
        };
        this.vertices.push(vertex);
        return vertex;
    }
    
    addEdge(sourceId, targetId, weight = 0, directed = null) {
        // Validar IDs de vértices
        if (!this.getVertex(sourceId) || !this.getVertex(targetId)) {
            console.error('Vértices inválidos para la arista');
            return null;
        }
        
        // Validar peso
        if (this.weighted && (typeof weight !== 'number' || isNaN(weight) || !isFinite(weight) || weight < 0)) {
            console.error('Peso inválido para la arista');
            return null;
        }
        
        // Usar la dirección del grafo por defecto si no se especifica
        const edgeDirected = directed !== null ? directed : this.directed;
        
        // Validar que la arista no exista
        const edgeExists = this.edges.some(edge => {
            if (edgeDirected || this.directed) {
                // Para aristas dirigidas: verificar misma dirección
                return edge.source === sourceId && edge.target === targetId;
            } else {
                // Para aristas no dirigidas: verificar cualquier dirección
                return (edge.source === sourceId && edge.target === targetId) ||
                       (edge.source === targetId && edge.target === sourceId);
            }
        });
        
        if (edgeExists) {
            console.error('La arista ya existe');
            return null;
        }
        
        const id = `e${this.nextEdgeId++}`;
        const edge = {
            id,
            source: sourceId,
            target: targetId,
            directed: edgeDirected,
            weight: this.weighted ? Math.max(0, weight) : 0,
            label: this.weighted ? Math.max(0, weight).toString() : ''
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
        if (typeof weight !== 'number' || isNaN(weight) || !isFinite(weight) || weight < 0) {
            console.error('Peso inválido');
            return false;
        }
        
        const edge = this.getEdge(edgeId);
        if (edge) {
            edge.weight = Math.max(0, weight);
            edge.label = this.weighted ? edge.weight.toString() : '';
            return true;
        }
        return false;
    }
    
    updateEdgeDirection(edgeId, directed) {
        const edge = this.getEdge(edgeId);
        if (edge) {
            // Verificar si el cambio de dirección crearía un conflicto
            if (edge.directed !== directed) {
                // Para aristas no dirigidas, verificar si ya existe una arista en la dirección opuesta
                if (!directed) {
                    const oppositeEdgeExists = this.edges.some(e => 
                        e.source === edge.target && e.target === edge.source && e.id !== edgeId
                    );
                    
                    if (oppositeEdgeExists) {
                        console.error('Ya existe una arista en la dirección opuesta');
                        return false;
                    }
                }
                
                edge.directed = directed;
                return true;
            }
        }
        return false;
    }
    
    addBidirectionalEdge(sourceId, targetId, weight = 0) {
        // Crear dos aristas dirigidas en ambas direcciones
        const edge1 = this.addEdge(sourceId, targetId, weight, true);
        const edge2 = this.addEdge(targetId, sourceId, weight, true);
        
        return edge1 && edge2 ? [edge1, edge2] : null;
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
                if (edge.directed) {
                    // Arista dirigida: solo llenar la posición i,j
                    matrix[i][j] = this.weighted ? edge.weight : 1;
                } else {
                    // Arista no dirigida: llenar ambas posiciones (matriz simétrica)
                    matrix[i][j] = this.weighted ? edge.weight : 1;
                    matrix[j][i] = this.weighted ? edge.weight : 1;
                }
            }
        });
        
        return matrix;
    }
    
    // Cambiar el tipo de dirección del grafo
    setGraphDirection(directed) {
        // Primero verificar si el cambio es posible
        if (directed === this.directed) return true;
        
        if (!directed) {
            // Cambiando de dirigido a no dirigido: verificar que no haya aristas conflictivas
            for (let i = 0; i < this.edges.length; i++) {
                for (let j = i + 1; j < this.edges.length; j++) {
                    const edge1 = this.edges[i];
                    const edge2 = this.edges[j];
                    
                    if (edge1.source === edge2.target && edge1.target === edge2.source) {
                        console.error('No se puede cambiar a no dirigido: existen aristas bidireccionales');
                        return false;
                    }
                }
            }
        }
        
        this.directed = directed;
        
        // Actualizar la dirección de todas las aristas existentes
        this.edges.forEach(edge => {
            edge.directed = directed;
        });
        
        return true;
    }
    
    // Exportar el grafo como objeto JSON
    exportToJSON() {
        return {
            vertices: this.vertices,
            edges: this.edges,
            directed: this.directed,
            weighted: this.weighted,
            nextVertexId: this.nextVertexId,
            nextEdgeId: this.nextEdgeId
        };
    }
    
    // Importar grafo desde objeto JSON
    importFromJSON(data) {
        if (!data.vertices || !data.edges) {
            console.error('Datos de importación inválidos');
            return false;
        }
        
        this.vertices = data.vertices;
        this.edges = data.edges;
        this.directed = data.directed || false;
        this.weighted = data.weighted || false;
        this.nextVertexId = data.nextVertexId || this.vertices.length + 1;
        this.nextEdgeId = data.nextEdgeId || this.edges.length + 1;
        
        return true;
    }
    
    // Ajustar el tamaño de los vértices según el texto
    adjustVertexSize(vertexId) {
        const vertex = this.getVertex(vertexId);
        if (vertex) {
            // Calcular el ancho aproximado del texto
            const textWidth = vertex.label.length * 8;
            // El radio será la mitad del ancho del texto + un margen
            vertex.radius = Math.max(20, textWidth / 2 + 10);
            return vertex.radius;
        }
        return null;
    }
}