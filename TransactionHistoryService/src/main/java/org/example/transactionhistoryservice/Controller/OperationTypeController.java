package org.example.transactionhistoryservice.Controller;

import org.example.transactionhistoryservice.Entite.OperationType;
import org.example.transactionhistoryservice.Service.OperationTypeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/operation-types")
public class OperationTypeController {

    private final OperationTypeService operationTypeService;

    public OperationTypeController(OperationTypeService historyService) {
        this.operationTypeService = historyService;
    }

    @PostMapping
    public OperationType create(@RequestBody OperationType operationType) {
        return operationTypeService.save(operationType);
    }

    @GetMapping
    public List<OperationType> getAll() {
        return operationTypeService.getAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<OperationType> getById(@PathVariable Long id) {
        return operationTypeService.getById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<OperationType> update(@PathVariable Long id, @RequestBody OperationType updated) {
        return ResponseEntity.ok(operationTypeService.update(id, updated));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        operationTypeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
