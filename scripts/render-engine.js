export class GraphRenderer {
    constructor(canvasId, graph) {
        this.canvas = document.getElementById(canvasId);
        this.graph = graph;
        this.selectedElement = null;
        
        // Crear definición de marcador para flechas
        this.createArrowMarker();
    }
    
    createArrowMarker() {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '7');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3.5');
        marker.setAttribute('orient', 'auto');
        
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
        polygon.setAttribute('fill', '#6c757d');
        
        marker.appendChild(polygon);
        defs.appendChild(marker);
        this.canvas.appendChild(defs);
    }
    
    render() {
        this.clearCanvas();
        this.renderEdges();
        this.renderVertices();
    }
    
    clearCanvas() {
        // Mantener solo la definición del marcador
        const defs = this.canvas.querySelector('defs');
        this.canvas.innerHTML = '';
        if (defs) {
            this.canvas.appendChild(defs);
        }
    }
    
    renderVertices() {
        this.graph.vertices.forEach(vertex => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('cx', vertex.x);
            circle.setAttribute('cy', vertex.y);
            circle.setAttribute('r', '15');
            circle.setAttribute('class', 'vertex');
            circle.setAttribute('fill', vertex.color);
            circle.setAttribute('data-id', vertex.id);
            
            if (this.selectedElement?.type === 'vertex' && this.selectedElement.id === vertex.id) {
                circle.classList.add('selected');
            }
            
            this.canvas.appendChild(circle);
            
            // Renderizar etiqueta
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', vertex.x);
            text.setAttribute('y', vertex.y + 5);
            text.setAttribute('class', 'vertex-text');
            text.setAttribute('text-anchor', 'middle');
            text.textContent = vertex.label;
            this.canvas.appendChild(text);
        });
    }
    
    renderEdges() {
        this.graph.edges.forEach(edge => {
            const sourceVertex = this.graph.getVertex(edge.source);
            const targetVertex = this.graph.getVertex(edge.target);
            
            if (!sourceVertex || !targetVertex) return;
            
            if (sourceVertex.id === targetVertex.id) {
                // Auto-conexión (arista al mismo nodo)
                this.renderSelfLoop(sourceVertex, edge);
            } else {
                // Arista normal entre nodos diferentes
                this.renderNormalEdge(sourceVertex, targetVertex, edge);
            }
        });
    }
    
    renderNormalEdge(sourceVertex, targetVertex, edge) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', sourceVertex.x);
        line.setAttribute('y1', sourceVertex.y);
        line.setAttribute('x2', targetVertex.x);
        line.setAttribute('y2', targetVertex.y);
        line.setAttribute('class', 'edge');
        line.setAttribute('data-id', edge.id);
        
        if (edge.directed) {
            line.classList.add('directed');
        }
        
        if (this.selectedElement?.type === 'edge' && this.selectedElement.id === edge.id) {
            line.classList.add('selected');
        }
        
        this.canvas.appendChild(line);
        
        // Renderizar peso si es ponderado
        if (this.graph.weighted) {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            const midX = (sourceVertex.x + targetVertex.x) / 2;
            const midY = (sourceVertex.y + targetVertex.y) / 2;
            text.setAttribute('x', midX);
            text.setAttribute('y', midY - 10);
            text.setAttribute('class', 'edge-text');
            text.setAttribute('text-anchor', 'middle');
            text.textContent = edge.weight.toString();
            this.canvas.appendChild(text);
        }
    }
    
    renderSelfLoop(vertex, edge) {
        // Dibujar un bucle (círculo) para auto-conexiones
        const loop = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        loop.setAttribute('cx', vertex.x);
        loop.setAttribute('cy', vertex.y - 25);
        loop.setAttribute('r', '15');
        loop.setAttribute('class', 'edge-loop');
        loop.setAttribute('data-id', edge.id);
        
        if (edge.directed) {
            loop.classList.add('directed');
            
            // Agregar marcador de flecha para auto-conexiones dirigidas
            loop.setAttribute('marker-end', 'url(#arrowhead)');
        }
        
        if (this.selectedElement?.type === 'edge' && this.selectedElement.id === edge.id) {
            loop.classList.add('selected');
        }
        
        this.canvas.appendChild(loop);
        
        // Renderizar peso si es ponderado
        if (this.graph.weighted) {
            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', vertex.x);
            text.setAttribute('y', vertex.y - 45);
            text.setAttribute('class', 'edge-text');
            text.setAttribute('text-anchor', 'middle');
            text.textContent = edge.weight.toString();
            this.canvas.appendChild(text);
        }
    }
    
    getElementAtPosition(x, y) {
        // Buscar vértices primero (están encima de las aristas)
        for (let i = this.graph.vertices.length - 1; i >= 0; i--) {
            const vertex = this.graph.vertices[i];
            const distance = Math.sqrt(Math.pow(vertex.x - x, 2) + Math.pow(vertex.y - y, 2));
            if (distance <= 15) {
                return { type: 'vertex', id: vertex.id };
            }
        }
        
        // Buscar aristas
        for (let i = this.graph.edges.length - 1; i >= 0; i--) {
            const edge = this.graph.edges[i];
            const sourceVertex = this.graph.getVertex(edge.source);
            const targetVertex = this.graph.getVertex(edge.target);
            
            if (!sourceVertex || !targetVertex) continue;
            
            if (sourceVertex.id === targetVertex.id) {
                // Auto-conexión: verificar si el clic está cerca del bucle
                const loopX = sourceVertex.x;
                const loopY = sourceVertex.y - 25;
                const distance = Math.sqrt(Math.pow(loopX - x, 2) + Math.pow(loopY - y, 2));
                
                if (distance <= 20) {
                    return { type: 'edge', id: edge.id };
                }
            } else {
                // Arista normal: calcular distancia desde el punto a la línea
                const distance = this.pointToLineDistance(x, y, sourceVertex.x, sourceVertex.y, targetVertex.x, targetVertex.y);
                
                if (distance <= 5) {
                    return { type: 'edge', id: edge.id };
                }
            }
        }
        
        return null;
    }
    
    pointToLineDistance(x, y, x1, y1, x2, y2) {
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        
        if (len_sq !== 0) {
            param = dot / len_sq;
        }
        
        let xx, yy;
        
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        const dx = x - xx;
        const dy = y - yy;
        
        return Math.sqrt(dx * dx + dy * dy);
    }
    
    selectElement(element) {
        this.selectedElement = element;
        this.render();
    }
    
    clearSelection() {
        this.selectedElement = null;
        this.render();
    }
}