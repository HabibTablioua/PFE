package org.example.transactionhistoryservice.Service;


import lombok.RequiredArgsConstructor;
import org.example.transactionhistoryservice.Entite.OperationType;
import org.example.transactionhistoryservice.Repository.OperationTypeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class OperationTypeService {

    @Autowired
    private OperationTypeRepository operationTypeRepository;

    public OperationType save(OperationType operationType) {
        return operationTypeRepository.save(operationType);
    }

    public List<OperationType> getAll() {
        return operationTypeRepository.findAll();
    }

    public Optional<OperationType> getById(Long id) {
        return operationTypeRepository.findById(id);
    }

    public OperationType update(Long id, OperationType updated) {
        OperationType existing = operationTypeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Operation Type not found"));
        existing.setName(updated.getName());
        existing.setCode(updated.getCode());
        existing.setDescription(updated.getDescription());
        return operationTypeRepository.save(existing);
    }

    public void delete(Long id) {
        operationTypeRepository.deleteById(id);
    }
}
