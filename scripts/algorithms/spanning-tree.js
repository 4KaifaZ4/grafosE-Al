/**
 * Algoritmos de árbol de expansión
 */

export class SpanningTree {
    constructor(graph) {
        this.graph = graph;
    }

    /**
     * Algoritmo de Prim para árbol de expansión mínima
     */
    prim() {
        if (this.graph.vertices.length === 0) {
            return { edges: [], totalWeight: 0 };
        }
        
        const inMST = new Set();
        const edgesInMST = [];
        let totalWeight = 0;
        
        // Comenzar con el primer vértice
        inMST.add(this.graph.vertices[0].id);
        
        // Continuar hasta que todos los vértices estén en el MST
        while (inMST.size < this.graph.vertices.length) {
            let minEdge = null;
            let minWeight = Infinity;
            
            // Encontrar la arista de peso mínimo que conecta el MST con un vértice fuera del MST
            for (const edge of this.graph.edges) {
                const sourceInMST = inMST.has(edge.source);
                const targetInMST = inMST.has(edge.target);
                
                // La arista debe conectar un vértice en el MST con uno fuera del MST
                if ((sourceInMST && !targetInMST) || (!sourceInMST && targetInMST && !edge.directed)) {
                    if (edge.weight < minWeight) {
                        minWeight = edge.weight;
                        minEdge = edge;
                    }
                }
            }
            
            if (minEdge === null) {
                // El grafo no es conexo
                break;
            }
            
            // Agregar la arista al MST
            edgesInMST.push(minEdge);
            totalWeight += minEdge.weight;
            
            // Agregar el nuevo vértice al MST
            if (inMST.has(minEdge.source)) {
                inMST.add(minEdge.target);
            } else {
                inMST.add(minEdge.source);
            }
        }
        
        return { edges: edgesInMST, totalWeight };
    }

    /**
     * Algoritmo de Kruskal para árbol de expansión mínima
     */
    kruskal() {
        if (this.graph.vertices.length === 0) {
            return { edges: [], totalWeight: 0 };
        }
        
        const edgesInMST = [];
        let totalWeight = 0;
        
        // Estructuras para Union-Find
        const parent = {};
        const rank = {};
        
        // Inicializar Union-Find
        this.graph.vertices.forEach(vertex => {
            parent[vertex.id] = vertex.id;
            rank[vertex.id] = 0;
        });
        
        // Ordenar aristas por peso
        const sortedEdges = [...this.graph.edges].sort((a, b) => a.weight - b.weight);
        
        // Función para encontrar la raíz de un conjunto
        const find = (vertexId) => {
            if (parent[vertexId] !== vertexId) {
                parent[vertexId] = find(parent[vertexId]); // Compresión de camino
            }
            return parent[vertexId];
        };
        
        // Función para unir dos conjuntos
        const union = (root1, root2) => {
            if (rank[root1] > rank[root2]) {
                parent[root2] = root1;
            } else if (rank[root1] < rank[root2]) {
                parent[root1] = root2;
            } else {
                parent[root2] = root1;
                rank[root1]++;
            }
        };
        
        // Procesar aristas en orden de peso creciente
        for (const edge of sortedEdges) {
            const root1 = find(edge.source);
            const root2 = find(edge.target);
            
            // Si los vértices están en conjuntos diferentes, agregar la arista al MST
            if (root1 !== root2) {
                edgesInMST.push(edge);
                totalWeight += edge.weight;
                union(root1, root2);
                
                // Si ya tenemos un árbol de expansión completo, terminar
                if (edgesInMST.length === this.graph.vertices.length - 1) {
                    break;
                }
            }
        }
        
        return { edges: edgesInMST, totalWeight };
    }

    /**
     * Algoritmo de Borůvka para árbol de expansión mínima
     */
    boruvka() {
        if (this.graph.vertices.length === 0) {
            return { edges: [], totalWeight: 0 };
        }
        
        const edgesInMST = [];
        let totalWeight = 0;
        
        // Estructuras para Union-Find
        const parent = {};
        const rank = {};
        
        // Inicializar Union-Find
        this.graph.vertices.forEach(vertex => {
            parent[vertex.id] = vertex.id;
            rank[vertex.id] = 0;
        });
        
        // Función para encontrar la raíz de un conjunto
        const find = (vertexId) => {
            if (parent[vertexId] !== vertexId) {
                parent[vertexId] = find(parent[vertexId]); // Compresión de camino
            }
            return parent[vertexId];
        };
        
        // Función para unir dos conjuntos
        const union = (root1, root2) => {
            if (rank[root1] > rank[root2]) {
                parent[root2] = root1;
            } else if (rank[root1] < rank[root2]) {
                parent[root1] = root2;
            } else {
                parent[root2] = root1;
                rank[root1]++;
            }
        };
        
        // Número de componentes inicialmente
        let componentCount = this.graph.vertices.length;
        
        // Mientras haya más de un componente
        while (componentCount > 1) {
            // Para cada componente, encontrar la arista más barata que lo conecta con otro componente
            const cheapest = {};
            
            for (const edge of this.graph.edges) {
                const root1 = find(edge.source);
                const root2 = find(edge.target);
                
                if (root1 === root2) {
                    continue; // Ignorar aristas dentro del mismo componente
                }
                
                // Para el componente de root1
                if (!cheapest[root1] || edge.weight < cheapest[root1].weight) {
                    cheapest[root1] = { edge, root: root2 };
                }
                
                // Para el componente de root2 (solo si el grafo es no dirigido)
                if (!this.graph.directed && (!cheapest[root2] || edge.weight < cheapest[root2].weight)) {
                    cheapest[root2] = { edge, root: root1 };
                }
            }
            
            // Agregar las aristas encontradas al MST
            for (const root in cheapest) {
                const { edge, root: otherRoot } = cheapest[root];
                const root1 = find(edge.source);
                const root2 = find(edge.target);
                
                if (root1 !== root2) {
                    edgesInMST.push(edge);
                    totalWeight += edge.weight;
                    union(root1, root2);
                    componentCount--;
                }
            }
        }
        
        return { edges: edgesInMST, totalWeight };
    }

    /**
     * Encuentra todos los árboles de expansión posibles (solo para grafos pequeños)
     */
    findAllSpanningTrees() {
        // Este método es computacionalmente costoso y solo es práctico para grafos pequeños
        if (this.graph.vertices.length > 6) {
            throw new Error("El grafo es demasiado grande para encontrar todos los árboles de expansión");
        }
        
        const allSpanningTrees = [];
        const edgeCount = this.graph.edges.length;
        const vertexCount = this.graph.vertices.length;
        
        // Generar todas las combinaciones posibles de aristas de tamaño vertexCount - 1
        const combinations = this.getCombinations(this.graph.edges, vertexCount - 1);
        
        // Verificar cada combinación para ver si forma un árbol de expansión
        for (const combination of combinations) {
            if (this.isSpanningTree(combination)) {
                allSpanningTrees.push(combination);
            }
        }
        
        return allSpanningTrees;
    }

    /**
     * Verifica si un conjunto de aristas forma un árbol de expansión
     */
    isSpanningTree(edges) {
        // Un árbol de expansión debe tener exactamente V-1 aristas
        if (edges.length !== this.graph.vertices.length - 1) {
            return false;
        }
        
        // Verificar que el grafo sea conexo con estas aristas
        const visited = new Set();
        const adjList = {};
        
        // Construir lista de adyacencia
        this.graph.vertices.forEach(vertex => {
            adjList[vertex.id] = [];
        });
        
        edges.forEach(edge => {
            adjList[edge.source].push(edge.target);
            if (!edge.directed) {
                adjList[edge.target].push(edge.source);
            }
        });
        
        // BFS para verificar conectividad
        const queue = [this.graph.vertices[0].id];
        visited.add(this.graph.vertices[0].id);
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            for (const neighbor of adjList[current]) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push(neighbor);
                }
            }
        }
        
        // Debe visitar todos los vértices
        return visited.size === this.graph.vertices.length;
    }

    /**
     * Genera todas las combinaciones de tamaño k de un array
     */
    getCombinations(arr, k) {
        const result = [];
        
        const combine = (start, current) => {
            if (current.length === k) {
                result.push([...current]);
                return;
            }
            
            for (let i = start; i < arr.length; i++) {
                current.push(arr[i]);
                combine(i + 1, current);
                current.pop();
            }
        };
        
        combine(0, []);
        return result;
    }

    /**
     * Calcula el árbol de expansión mínima usando el algoritmo especificado
     */
    calculateMinimumSpanningTree(algorithm = 'prim') {
        switch (algorithm) {
            case 'prim':
                return this.prim();
            case 'kruskal':
                return this.kruskal();
            case 'boruvka':
                return this.boruvka();
            default:
                throw new Error(`Algoritno desconocido: ${algorithm}`);
        }
    }

    /**
     * Encuentra el árbol de expansión mínima para cada componente conexo
     */
    calculateMinimumSpanningForest() {
        // Encontrar componentes conexos
        const components = this.findConnectedComponents();
        const forest = [];
        let totalWeight = 0;
        
        // Calcular MST para cada componente
        for (const component of components) {
            // Crear un subgrafo para el componente
            const subgraph = {
                vertices: this.graph.vertices.filter(v => component.includes(v.id)),
                edges: this.graph.edges.filter(e => 
                    component.includes(e.source) && component.includes(e.target)
                ),
                directed: this.graph.directed,
                weighted: this.graph.weighted
            };
            
            // Calcular MST para el subgrafo
            const spanningTreeAlgo = new SpanningTree(subgraph);
            const mst = spanningTreeAlgo.calculateMinimumSpanningTree();
            
            forest.push({
                component,
                edges: mst.edges,
                weight: mst.totalWeight
            });
            
            totalWeight += mst.totalWeight;
        }
        
        return { forest, totalWeight };
    }

    /**
     * Encuentra componentes conexos del grafo
     */
    findConnectedComponents() {
        const visited = new Set();
        const components = [];
        
        for (const vertex of this.graph.vertices) {
            if (!visited.has(vertex.id)) {
                const component = [];
                const queue = [vertex.id];
                visited.add(vertex.id);
                component.push(vertex.id);
                
                while (queue.length > 0) {
                    const current = queue.shift();
                    
                    // Encontrar vecinos
                    const neighbors = [];
                    this.graph.edges.forEach(edge => {
                        if (edge.source === current && !visited.has(edge.target)) {
                            neighbors.push(edge.target);
                        }
                        if (!edge.directed && edge.target === current && !visited.has(edge.source)) {
                            neighbors.push(edge.source);
                        }
                    });
                    
                    for (const neighbor of neighbors) {
                        visited.add(neighbor);
                        queue.push(neighbor);
                        component.push(neighbor);
                    }
                }
                
                components.push(component);
            }
        }
        
        return components;
    }
}