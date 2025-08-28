export class UIController {
    constructor(graph, renderer) {
        this.graph = graph;
        this.renderer = renderer;
        this.currentMode = 'select';
        this.selectedElement = null;
        this.edgeStartVertex = null;
        this.currentEdgeForWeight = null;
        
        this.init();
    }
    
    init() {
        this.updateMetrics();
        this.updateDirectedToggle();
        this.updateWeightedToggle();
        this.updateAdjacencyMatrix();
    }
    
    setMode(mode) {
        this.currentMode = mode;
        this.edgeStartVertex = null;
        
        // Actualizar estado visual de los botones
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const activeBtn = document.querySelector(`#${mode}Btn`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        this.renderer.clearSelection();
        this.updatePropertiesPanel();
    }
    
    handleCanvasClick(event) {
        const rect = this.renderer.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        switch(this.currentMode) {
            case 'addVertex':
                this.addVertex(x, y);
                break;
            case 'addEdge':
                this.handleEdgeCreation(x, y);
                break;
            case 'select':
                this.handleSelection(x, y);
                break;
            case 'delete':
                this.handleDeletion(x, y);
                break;
        }
    }
    
    addVertex(x, y) {
        this.graph.addVertex(x, y);
        this.renderer.render();
        this.updateMetrics();
        this.updateAdjacencyMatrix();
    }
    
    handleEdgeCreation(x, y) {
        const element = this.renderer.getElementAtPosition(x, y);
        
        if (element && element.type === 'vertex') {
            if (!this.edgeStartVertex) {
                // Primer vértice seleccionado
                this.edgeStartVertex = element.id;
                // Resaltar visualmente el vértice seleccionado
                const vertexElement = this.renderer.canvas.querySelector(`[data-id="${element.id}"]`);
                if (vertexElement) {
                    vertexElement.style.fill = '#28a745';
                }
            } else {
                // Segundo vértice seleccionado, crear arista
                if (this.edgeStartVertex !== element.id) {
                    let weight = 1;
                    
                    // Si el grafo es ponderado, pedir el peso
                    if (this.graph.weighted) {
                        const weightInput = prompt('Ingrese el peso de la arista:', '1');
                        if (weightInput === null) return; // Usuario canceló
                        weight = parseInt(weightInput) || 1;
                    }
                    
                    this.graph.addEdge(this.edgeStartVertex, element.id, weight);
                    this.renderer.render();
                    this.updateMetrics();
                    this.updateAdjacencyMatrix();
                }
                
                // Restaurar color original del vértice
                const vertexElement = this.renderer.canvas.querySelector(`[data-id="${this.edgeStartVertex}"]`);
                if (vertexElement) {
                    vertexElement.style.fill = '#6f42c1';
                }
                
                this.edgeStartVertex = null;
            }
        } else if (!element && this.edgeStartVertex) {
            // Clic en espacio vacío, cancelar creación de arista
            // Restaurar color original del vértice
            const vertexElement = this.renderer.canvas.querySelector(`[data-id="${this.edgeStartVertex}"]`);
            if (vertexElement) {
                vertexElement.style.fill = '#6f42c1';
            }
            
            this.edgeStartVertex = null;
        }
    }
    
    handleSelection(x, y) {
        const element = this.renderer.getElementAtPosition(x, y);
        
        if (element) {
            this.selectedElement = element;
            this.renderer.selectElement(element);
            this.updatePropertiesPanel();
        } else {
            this.selectedElement = null;
            this.renderer.clearSelection();
            this.updatePropertiesPanel();
        }
    }
    
    handleDeletion(x, y) {
        const element = this.renderer.getElementAtPosition(x, y);
        
        if (element) {
            if (element.type === 'vertex') {
                this.graph.removeVertex(element.id);
            } else if (element.type === 'edge') {
                this.graph.removeEdge(element.id);
            }
            
            this.renderer.render();
            this.updateMetrics();
            this.updateAdjacencyMatrix();
            this.updatePropertiesPanel();
        }
    }
    
    updatePropertiesPanel() {
        const panel = document.getElementById('propertiesPanel');
        
        if (!this.selectedElement) {
            panel.innerHTML = '<p class="text-muted">Selecciona un elemento para editar sus propiedades</p>';
            return;
        }
        
        if (this.selectedElement.type === 'vertex') {
            const vertex = this.graph.getVertex(this.selectedElement.id);
            panel.innerHTML = `
                <h6 class="mb-3">Propiedades del Vértice</h6>
                <div class="mb-2">
                    <label class="form-label small">ID:</label>
                    <input type="text" class="form-control form-control-sm" value="${vertex.id}" disabled>
                </div>
                <div class="mb-2">
                    <label class="form-label small">Etiqueta:</label>
                    <input type="text" class="form-control form-control-sm" value="${vertex.label}" id="vertexLabelInput">
                </div>
                <div class="mb-2">
                    <label class="form-label small">Color:</label>
                    <input type="color" class="form-control form-control-sm" value="${vertex.color}" id="vertexColorInput">
                </div>
                <button class="btn btn-primary btn-sm mt-2" id="saveVertexBtn">Guardar Cambios</button>
            `;
            
            // Agregar event listeners
            document.getElementById('saveVertexBtn').addEventListener('click', () => {
                const labelInput = document.getElementById('vertexLabelInput');
                const colorInput = document.getElementById('vertexColorInput');
                
                vertex.label = labelInput.value;
                vertex.color = colorInput.value;
                
                this.renderer.render();
                this.updateAdjacencyMatrix();
            });
        } else if (this.selectedElement.type === 'edge') {
            const edge = this.graph.getEdge(this.selectedElement.id);
            const sourceVertex = this.graph.getVertex(edge.source);
            const targetVertex = this.graph.getVertex(edge.target);
            
            panel.innerHTML = `
                <h6 class="mb-3">Propiedades de la Arista</h6>
                <div class="mb-2">
                    <label class="form-label small">ID:</label>
                    <input type="text" class="form-control form-control-sm" value="${edge.id}" disabled>
                </div>
                <div class="mb-2">
                    <label class="form-label small">Desde:</label>
                    <input type="text" class="form-control form-control-sm" value="${sourceVertex.label}" disabled>
                </div>
                <div class="mb-2">
                    <label class="form-label small">Hacia:</label>
                    <input type="text" class="form-control form-control-sm" value="${targetVertex.label}" disabled>
                </div>
            `;
            
            if (this.graph.weighted) {
                panel.innerHTML += `
                    <div class="mb-2">
                        <label class="form-label small">Peso:</label>
                        <div class="d-flex">
                            <input type="number" class="form-control form-control-sm" value="${edge.weight}" id="edgeWeightInput">
                            <button class="btn btn-primary btn-sm ms-2" id="editWeightBtn">Editar</button>
                        </div>
                    </div>
                `;
                
                // Agregar event listener al botón de editar peso
                document.getElementById('editWeightBtn').addEventListener('click', () => {
                    this.showWeightModal(edge);
                });
            }
        }
    }
    
    showWeightModal(edge) {
        this.currentEdgeForWeight = edge;
        const weightInput = document.getElementById('weightInput');
        weightInput.value = edge.weight;
        
        const weightModal = new bootstrap.Modal(document.getElementById('weightModal'));
        weightModal.show();
    }
    
    saveEdgeWeight() {
        if (this.currentEdgeForWeight) {
            const weightInput = document.getElementById('weightInput');
            const weight = parseInt(weightInput.value) || 1;
            
            this.graph.updateEdgeWeight(this.currentEdgeForWeight.id, weight);
            this.renderer.render();
            this.updateAdjacencyMatrix();
            this.updatePropertiesPanel();
            
            // Cerrar el modal
            const weightModal = bootstrap.Modal.getInstance(document.getElementById('weightModal'));
            weightModal.hide();
        }
    }
    
    updateMetrics() {
        const metrics = this.graph.getMetrics();
        document.getElementById('vertexCount').textContent = metrics.vertexCount;
        document.getElementById('edgeCount').textContent = metrics.edgeCount;
        document.getElementById('graphType').textContent = metrics.graphType;
    }
    
    updateAdjacencyMatrix() {
        const matrix = this.graph.getAdjacencyMatrix();
        const table = document.getElementById('adjacencyMatrix');
        
        if (matrix.length === 0) {
            table.innerHTML = '<tr><td class="text-center text-muted">Crea un grafo para ver la matriz</td></tr>';
            return;
        }
        
        let html = '<tr><th></th>';
        
        // Encabezados de columnas (vértices)
        this.graph.vertices.forEach(vertex => {
            html += `<th>${vertex.label}</th>`;
        });
        html += '</tr>';
        
        // Filas de la matriz
        matrix.forEach((row, i) => {
            html += `<tr><th>${this.graph.vertices[i].label}</th>`;
            row.forEach(cell => {
                html += `<td>${cell}</td>`;
            });
            html += '</tr>';
        });
        
        table.innerHTML = html;
    }
    
    updateDirectedToggle() {
        const btn = document.getElementById('directedToggle');
        btn.textContent = this.graph.directed ? 'Dirigido' : 'No Dirigido';
        btn.classList.toggle('active', this.graph.directed);
    }
    
    updateWeightedToggle() {
        const btn = document.getElementById('weightedToggle');
        btn.textContent = this.graph.weighted ? 'Ponderado' : 'No Ponderado';
        btn.classList.toggle('active', this.graph.weighted);
    }
}