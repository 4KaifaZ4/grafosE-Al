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
        this.restoreVertexColor();
        
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
        
        // Validar que el clic esté dentro del canvas
        if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
            return;
        }
        
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
        const vertex = this.graph.addVertex(x, y);
        if (vertex) {
            this.graph.adjustVertexSize(vertex.id);
            this.renderer.render();
            this.updateMetrics();
            this.updateAdjacencyMatrix();
        } else {
            alert('No se pudo crear el vértice. Verifique las coordenadas.');
        }
    }
    
    handleEdgeCreation(x, y) {
        const element = this.renderer.getElementAtPosition(x, y);
        
        if (element && element.type === 'vertex') {
            if (!this.edgeStartVertex) {
                // Primer vértice seleccionado
                this.edgeStartVertex = element.id;
                // Resaltar visualmente el vértice seleccionado
                this.highlightVertex(element.id, '#28a745');
            } else {
                // Segundo vértice seleccionado, crear arista
                let weight = 0;
                
                // Si el grafo es ponderado, pedir el peso
                if (this.graph.weighted) {
                    let weightInput;
                    do {
                        weightInput = prompt('Ingrese el peso de la arista (número mayor o igual a 0):', '0');
                        if (weightInput === null) {
                            // Usuario canceló
                            this.restoreVertexColor();
                            this.edgeStartVertex = null;
                            return;
                        }
                        
                        weight = parseFloat(weightInput);
                        if (isNaN(weight) || weight < 0) {
                            alert('Por favor ingrese un número válido mayor o igual a 0.');
                        }
                    } while (isNaN(weight) || weight < 0);
                }
                
                // Preguntar por la dirección si el grafo es dirigido
                let directed = this.graph.directed;
                if (this.graph.directed) {
                    const directionInput = confirm('¿Crear arista bidireccional? (Cancelar para arista unidireccional)');
                    if (directionInput) {
                        // Crear aristas bidireccionales
                        const edges = this.graph.addBidirectionalEdge(this.edgeStartVertex, element.id, weight);
                        if (!edges) {
                            alert('No se pudieron crear las aristas bidireccionales. Puede que ya existan.');
                        }
                    } else {
                        // Crear arista unidireccional
                        const edge = this.graph.addEdge(this.edgeStartVertex, element.id, weight, true);
                        if (!edge) {
                            alert('No se pudo crear la arista. Puede que ya exista.');
                        }
                    }
                } else {
                    // Para grafos no dirigidos, crear arista normal
                    const edge = this.graph.addEdge(this.edgeStartVertex, element.id, weight);
                    if (!edge) {
                        alert('No se pudo crear la arista. Puede que ya exista.');
                    }
                }
                
                this.renderer.render();
                this.updateMetrics();
                this.updateAdjacencyMatrix();
                
                // Restaurar color original del vértice
                this.restoreVertexColor();
                this.edgeStartVertex = null;
            }
        } else if (!element && this.edgeStartVertex) {
            // Clic en espacio vacío, cancelar creación de arista
            this.restoreVertexColor();
            this.edgeStartVertex = null;
        }
    }
    
    highlightVertex(vertexId, color) {
        const vertexElement = this.renderer.canvas.querySelector(`[data-id="${vertexId}"]`);
        if (vertexElement) {
            vertexElement.style.fill = color;
        }
    }
    
    restoreVertexColor() {
        if (this.edgeStartVertex) {
            const vertex = this.graph.getVertex(this.edgeStartVertex);
            if (vertex) {
                const vertexElement = this.renderer.canvas.querySelector(`[data-id="${this.edgeStartVertex}"]`);
                if (vertexElement) {
                    vertexElement.style.fill = vertex.color;
                }
            }
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
            let success = false;
            if (element.type === 'vertex') {
                success = this.graph.removeVertex(element.id);
            } else if (element.type === 'edge') {
                success = this.graph.removeEdge(element.id);
            }
            
            if (success) {
                this.renderer.render();
                this.updateMetrics();
                this.updateAdjacencyMatrix();
                this.updatePropertiesPanel();
            } else {
                alert('No se pudo eliminar el elemento.');
            }
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
                    <input type="text" class="form-control form-control-sm" value="${vertex.label}" id="vertexLabelInput" maxlength="15">
                </div>
                <div class="mb-2">
                    <label class="form-label small">Color:</label>
                    <input type="color" class="form-control form-control-sm" value="${vertex.color}" id="vertexColorInput">
                </div>
                <button class="btn btn-primary btn-sm mt-2" id="saveVertexBtn">Guardar Cambios</button>
            `;
            
            // Agregar event listeners
            const saveVertexBtn = document.getElementById('saveVertexBtn');
            if (saveVertexBtn) {
                saveVertexBtn.addEventListener('click', () => {
                    const labelInput = document.getElementById('vertexLabelInput');
                    const colorInput = document.getElementById('vertexColorInput');
                    
                    // Validar etiqueta
                    if (labelInput.value.trim() === '') {
                        alert('La etiqueta no puede estar vacía');
                        return;
                    }
                    
                    vertex.label = labelInput.value.trim();
                    vertex.color = colorInput.value;
                    
                    // Ajustar el tamaño del vértice según el texto
                    this.graph.adjustVertexSize(vertex.id);
                    
                    this.renderer.render();
                    this.updateAdjacencyMatrix();
                });
            }
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
                <div class="mb-2">
                    <label class="form-label small">Dirección:</label>
                    <input type="text" class="form-control form-control-sm" value="${edge.directed ? 'Dirigida' : 'No Dirigida'}" disabled>
                </div>
            `;
            
            if (this.graph.weighted) {
                panel.innerHTML += `
                    <div class="mb-2">
                        <label class="form-label small">Peso:</label>
                        <div class="d-flex">
                            <input type="number" class="form-control form-control-sm" value="${edge.weight}" id="edgeWeightInput" min="0" step="0.1" disabled>
                            <button class="btn btn-primary btn-sm ms-2" id="editWeightBtn">Editar</button>
                        </div>
                    </div>
                `;
                
                // Agregar event listener al botón de editar peso
                const editWeightBtn = document.getElementById('editWeightBtn');
                if (editWeightBtn) {
                    editWeightBtn.addEventListener('click', () => {
                        this.showWeightModal(edge);
                    });
                }
            }
            
            // Mostrar opción de cambiar dirección para aristas dirigidas
            if (this.graph.directed && edge.directed) {
                panel.innerHTML += `
                    <div class="mb-2">
                        <label class="form-label small">Cambiar Dirección:</label>
                        <select class="form-select form-select-sm" id="edgeDirectionSelect">
                            <option value="true" ${edge.directed ? 'selected' : ''}>De ${sourceVertex.label} a ${targetVertex.label}</option>
                            <option value="false" ${!edge.directed ? 'selected' : ''}>De ${targetVertex.label} a ${sourceVertex.label}</option>
                        </select>
                    </div>
                    <button class="btn btn-primary btn-sm mt-2" id="saveDirectionBtn">Cambiar Dirección</button>
                `;
                
                // Agregar event listener al botón de cambiar dirección
                const saveDirectionBtn = document.getElementById('saveDirectionBtn');
                if (saveDirectionBtn) {
                    saveDirectionBtn.addEventListener('click', () => {
                        const directionSelect = document.getElementById('edgeDirectionSelect');
                        const newDirection = directionSelect.value === 'true';
                        
                        if (this.graph.updateEdgeDirection(edge.id, newDirection)) {
                            this.renderer.render();
                            this.updateAdjacencyMatrix();
                            this.updatePropertiesPanel(); // Actualizar panel para mostrar cambios
                        } else {
                            alert('No se pudo cambiar la dirección. Verifique que no exista una arista en la dirección opuesta.');
                        }
                    });
                }
            }
        }
    }
    
    showWeightModal(edge) {
        this.currentEdgeForWeight = edge;
        const weightInput = document.getElementById('weightInput');
        if (weightInput) {
            weightInput.value = edge.weight;
        }
        
        const weightModal = new bootstrap.Modal(document.getElementById('weightModal'));
        weightModal.show();
        
        // Enfocar el input y seleccionar su contenido
        setTimeout(() => {
            if (weightInput) {
                weightInput.focus();
                weightInput.select();
            }
        }, 100);
    }
    
    saveEdgeWeight() {
        if (this.currentEdgeForWeight) {
            const weightInput = document.getElementById('weightInput');
            if (!weightInput) return;
            
            let weight = parseFloat(weightInput.value);
            
            // Validar el peso
            if (isNaN(weight) || weight < 0) {
                alert('Por favor ingrese un número válido mayor o igual a 0.');
                weightInput.focus();
                weightInput.select();
                return;
            }
            
            if (this.graph.updateEdgeWeight(this.currentEdgeForWeight.id, weight)) {
                this.renderer.render();
                this.updateAdjacencyMatrix();
                this.updatePropertiesPanel();
                
                // Cerrar el modal
                const weightModal = bootstrap.Modal.getInstance(document.getElementById('weightModal'));
                if (weightModal) {
                    weightModal.hide();
                }
            } else {
                alert('No se pudo actualizar el peso. La arista puede haber sido eliminada.');
            }
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
        
        if (!table) return;
        
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
        if (btn) {
            btn.textContent = this.graph.directed ? 'Dirigido' : 'No Dirigido';
            btn.classList.toggle('active', this.graph.directed);
        }
    }
    
    updateWeightedToggle() {
        const btn = document.getElementById('weightedToggle');
        if (btn) {
            btn.textContent = this.graph.weighted ? 'Ponderado' : 'No Ponderado';
            btn.classList.toggle('active', this.graph.weighted);
        }
    }
    
    // Exportar el grafo como JSON
    exportGraph() {
        const data = this.graph.exportToJSON();
        const dataStr = JSON.stringify(data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        
        const exportFileDefaultName = 'grafo.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
    
    // Importar grafo desde JSON
    importGraph() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = e => {
            const file = e.target.files[0];
            const reader = new FileReader();
            
            reader.onload = event => {
                try {
                    const graphData = JSON.parse(event.target.result);
                    
                    if (this.graph.importFromJSON(graphData)) {
                        this.renderer.render();
                        this.updateMetrics();
                        this.updateAdjacencyMatrix();
                        this.updateDirectedToggle();
                        this.updateWeightedToggle();
                        alert('Grafo importado correctamente.');
                    } else {
                        alert('Error al importar el grafo. El archivo puede estar corrupto.');
                    }
                } catch (error) {
                    alert('Error al leer el archivo: ' + error.message);
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    // Exportar como imagen
    exportAsImage() {
        this.renderer.exportAsImage();
    }
}