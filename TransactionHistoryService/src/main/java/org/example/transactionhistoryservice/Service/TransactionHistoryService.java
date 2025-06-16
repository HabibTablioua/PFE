package org.example.transactionhistoryservice.Service;


import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.example.transactionhistoryservice.DTO.TransactionHistoryRequest;
import org.example.transactionhistoryservice.Entite.TransactionHistory;
import org.example.transactionhistoryservice.Repository.OperationTypeRepository;
import org.example.transactionhistoryservice.Repository.TransactionHistoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TransactionHistoryService {

    @Autowired
    private TransactionHistoryRepository repository;

    @Autowired
    private OperationTypeRepository operationTypeRepository; // Ajout du repository OperationType

    private final ObjectMapper objectMapper = new ObjectMapper();

    public void save(TransactionHistoryRequest request) {
        try {
            String fieldsJson = objectMapper.writeValueAsString(request.getFields());

            TransactionHistory  history = new TransactionHistory();
            history.setMti(request.getMti());
            history.setFieldsJson(fieldsJson);
            history.setMessage(request.getMessage());
            history.setFormat(request.getFormat());
            history.setSource(request.getSource());
            history.setStatus(request.getStatus());

            // Extraire le processing code depuis les champs (champ 3)
            String processingCode = request.getFields().get("3");
            if (processingCode != null) {
                operationTypeRepository.findByCode(processingCode)
                        .ifPresent(history::setOperationType);
            }

            repository.save(history);
        } catch (Exception e) {
            throw new RuntimeException("❌ Error saving transaction history", e);
        }
    }
    public List<TransactionHistory> getAll() {
        return repository.findAll();
    }

    public List<TransactionHistory> searchByMti(String mti) {
        return repository.findByMti(mti);
    }

    public List<TransactionHistory> searchByFormat(String format) {
        return repository.findByFormat(format);
    }

    public List<TransactionHistory> searchBySource(String source) {
        return repository.findBySource(source);
    }

    public List<TransactionHistory> searchByDateRange(LocalDateTime start, LocalDateTime end) {
        return repository.findByCreatedAtBetween(start, end);
    }

    public Optional<TransactionHistory> getById(Long id) {
        return repository.findById(id);
    }

    public TransactionHistory update(Long id, TransactionHistory updated) {
        TransactionHistory existing = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
        existing.setMti(updated.getMti());
        existing.setFieldsJson(updated.getFieldsJson());
        existing.setMessage(updated.getMessage());
        existing.setFormat(updated.getFormat());
        existing.setSource(updated.getSource());
        existing.setStatus(updated.getStatus());
        return repository.save(existing);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }

    public void deleteAll() {
        repository.deleteAll();
    }




}
