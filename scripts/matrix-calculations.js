/**
 * Cálculos de matrices para grafos
 */

export class MatrixCalculations {
    constructor(graph) {
        this.graph = graph;
    }

    /**
     * Calcula la matriz de adyacencia
     */
    getAdjacencyMatrix() {
        const size = this.graph.vertices.length;
        const matrix = Array(size).fill().map(() => Array(size).fill(0));
        
        // Mapear IDs de vértices a índices
        const vertexIndexMap = {};
        this.graph.vertices.forEach((vertex, index) => {
            vertexIndexMap[vertex.id] = index;
        });
        
        // Llenar la matriz de adyacencia
        this.graph.edges.forEach(edge => {
            const i = vertexIndexMap[edge.source];
            const j = vertexIndexMap[edge.target];
            
            if (i !== undefined && j !== undefined) {
                matrix[i][j] = edge.weight;
                
                if (!edge.directed) {
                    matrix[j][i] = edge.weight;
                }
            }
        });
        
        return matrix;
    }

    /**
     * Calcula la matriz de incidencia
     */
    getIncidenceMatrix() {
        const vertexCount = this.graph.vertices.length;
        const edgeCount = this.graph.edges.length;
        const matrix = Array(vertexCount).fill().map(() => Array(edgeCount).fill(0));
        
        // Mapear IDs de vértices a índices
        const vertexIndexMap = {};
        this.graph.vertices.forEach((vertex, index) => {
            vertexIndexMap[vertex.id] = index;
        });
        
        // Llenar la matriz de incidencia
        this.graph.edges.forEach((edge, edgeIndex) => {
            const i = vertexIndexMap[edge.source];
            const j = vertexIndexMap[edge.target];
            
            if (i !== undefined && j !== undefined) {
                if (this.graph.directed) {
                    matrix[i][edgeIndex] = -1; // Salida
                    matrix[j][edgeIndex] = 1;  // Entrada
                } else {
                    matrix[i][edgeIndex] = 1;
                    matrix[j][edgeIndex] = 1;
                }
            }
        });
        
        return matrix;
    }

    /**
     * Calcula la matriz de distancias (camino más corto)
     */
    getDistanceMatrix() {
        const size = this.graph.vertices.length;
        const matrix = Array(size).fill().map(() => Array(size).fill(Infinity));
        
        // Inicializar la diagonal con 0
        for (let i = 0; i < size; i++) {
            matrix[i][i] = 0;
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
                matrix[i][j] = edge.weight;
                
                if (!edge.directed) {
                    matrix[j][i] = edge.weight;
                }
            }
        });
        
        // Algoritmo de Floyd-Warshall para encontrar todas las distancias más cortas
        for (let k = 0; k < size; k++) {
            for (let i = 0; i < size; i++) {
                for (let j = 0; j < size; j++) {
                    if (matrix[i][k] + matrix[k][j] < matrix[i][j]) {
                        matrix[i][j] = matrix[i][k] + matrix[k][j];
                    }
                }
            }
        }
        
        return matrix;
    }

    /**
     * Calcula la matriz de alcanzabilidad
     */
    getReachabilityMatrix() {
        const distanceMatrix = this.getDistanceMatrix();
        const size = distanceMatrix.length;
        const matrix = Array(size).fill().map(() => Array(size).fill(0));
        
        for (let i = 0; i < size; i++) {
            for (let j = 0; j < size; j++) {
                matrix[i][j] = distanceMatrix[i][j] !== Infinity ? 1 : 0;
            }
        }
        
        return matrix;
    }

    /**
     * Calcula los valores y vectores propios de la matriz de adyacencia
     */
    getEigenvaluesAndEigenvectors() {
        // Implementación simplificada para matrices pequeñas
        // En una implementación real, se usaría una biblioteca como math.js
        const matrix = this.getAdjacencyMatrix();
        
        if (matrix.length === 0) {
            return { eigenvalues: [], eigenvectors: [] };
        }
        
        // Para matrices 2x2
        if (matrix.length === 2) {
            const a = matrix[0][0];
            const b = matrix[0][1];
            const c = matrix[1][0];
            const d = matrix[1][1];
            
            // Calcular eigenvalues: λ = (a+d ± √((a-d)² + 4bc)) / 2
            const discriminant = Math.sqrt((a - d) * (a - d) + 4 * b * c);
            const eigenvalue1 = (a + d + discriminant) / 2;
            const eigenvalue2 = (a + d - discriminant) / 2;
            
            // Calcular eigenvectors (simplificado)
            const eigenvectors = [
                [1, (eigenvalue1 - a) / (b || 1)],
                [1, (eigenvalue2 - a) / (b || 1)]
            ];
            
            return {
                eigenvalues: [eigenvalue1, eigenvalue2],
                eigenvectors: eigenvectors
            };
        }
        
        // Para matrices más grandes, devolver valores dummy
        // En una implementación real, se usaría una biblioteca numérica
        return {
            eigenvalues: Array(matrix.length).fill(0),
            eigenvectors: Array(matrix.length).fill().map(() => Array(matrix.length).fill(0))
        };
    }

    /**
     * Calcula el centro del grafo basado en la excentricidad
     */
    getGraphCenter() {
        const distanceMatrix = this.getDistanceMatrix();
        const size = distanceMatrix.length;
        
        if (size === 0) return [];
        
        // Calcular excentricidad de cada vértice
        const eccentricities = [];
        for (let i = 0; i < size; i++) {
            let maxDistance = 0;
            for (let j = 0; j < size; j++) {
                if (distanceMatrix[i][j] > maxDistance && distanceMatrix[i][j] !== Infinity) {
                    maxDistance = distanceMatrix[i][j];
                }
            }
            eccentricities.push(maxDistance);
        }
        
        // Encontrar la mínima excentricidad
        const minEccentricity = Math.min(...eccentricities);
        
        // Encontrar todos los vértices con esa excentricidad
        const center = [];
        for (let i = 0; i < size; i++) {
            if (eccentricities[i] === minEccentricity) {
                center.push(this.graph.vertices[i].id);
            }
        }
        
        return center;
    }

    /**
     * Calcula el radio y diámetro del grafo
     */
    getRadiusAndDiameter() {
        const distanceMatrix = this.getDistanceMatrix();
        const size = distanceMatrix.length;
        
        if (size === 0) return { radius: 0, diameter: 0 };
        
        // Calcular excentricidad de cada vértice
        const eccentricities = [];
        for (let i = 0; i < size; i++) {
            let maxDistance = 0;
            for (let j = 0; j < size; j++) {
                if (distanceMatrix[i][j] > maxDistance && distanceMatrix[i][j] !== Infinity) {
                    maxDistance = distanceMatrix[i][j];
                }
            }
            eccentricities.push(maxDistance);
        }
        
        const radius = Math.min(...eccentricities);
        const diameter = Math.max(...eccentricities);
        
        return { radius, diameter };
    }
}