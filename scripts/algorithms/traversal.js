export function breadthFirstSearch(graph, startVertexId) {
    if (!startVertexId || graph.vertices.length === 0) {
        return [];
    }
    
    const visited = new Set();
    const queue = [startVertexId];
    const result = [];
    
    visited.add(startVertexId);
    
    while (queue.length > 0) {
        const currentVertexId = queue.shift();
        result.push(graph.getVertex(currentVertexId).label);
        
        // Encontrar todos los vecinos
        const neighbors = graph.edges
            .filter(edge => edge.source === currentVertexId || (!edge.directed && edge.target === currentVertexId))
            .map(edge => edge.source === currentVertexId ? edge.target : edge.source);
        
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                visited.add(neighbor);
                queue.push(neighbor);
            }
        }
    }
    
    return result;
}

export function depthFirstSearch(graph, startVertexId) {
    if (!startVertexId || graph.vertices.length === 0) {
        return [];
    }
    
    const visited = new Set();
    const result = [];
    
    function dfs(vertexId) {
        visited.add(vertexId);
        result.push(graph.getVertex(vertexId).label);
        
        // Encontrar todos los vecinos
        const neighbors = graph.edges
            .filter(edge => edge.source === vertexId || (!edge.directed && edge.target === vertexId))
            .map(edge => edge.source === vertexId ? edge.target : edge.source);
        
        for (const neighbor of neighbors) {
            if (!visited.has(neighbor)) {
                dfs(neighbor);
            }
        }
    }
    
    dfs(startVertexId);
    return result;
}