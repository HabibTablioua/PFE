package org.example.accountservice.service;


import org.example.accountservice.DTO.AccountRequestDTO;
import org.example.accountservice.entities.Account;
import org.example.accountservice.entities.AccountCreationException;
import org.example.accountservice.entities.StatutCompte;
import org.example.accountservice.entities.TypeCompte;
import org.example.accountservice.repository.AccountRepository;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
public class AccountService {

    private final AccountRepository accountRepository;

    private AccountRequestDTO mapToResponseDTO(Account account) {
        return new AccountRequestDTO(
                account.getId(),
                account.getNumeroCompte(),
                account.getUserId(),
                account.getDevise(),
                account.getTypeCompte(),
                account.getStatut(),
                account.getDateOuverture()
        );
    }


    public AccountService(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    public AccountRequestDTO createAccount(AccountRequestDTO dto) {
        List<Account> existingAccounts = accountRepository.findAllByUserId(dto.getUserId());

        if (dto.getTypeCompte() == TypeCompte.EPARGNE || dto.getTypeCompte() == TypeCompte.PROFESSIONNEL) {
            boolean alreadyHasThisType = existingAccounts.stream()
                    .anyMatch(acc -> acc.getTypeCompte() == dto.getTypeCompte());

            if (alreadyHasThisType) {
                throw new AccountCreationException("L'utilisateur a déjà un compte de type " + dto.getTypeCompte());
            }
        }

        Account account = new Account();
        account.setUserId(dto.getUserId());
        account.setDevise(dto.getDevise());
        account.setTypeCompte(dto.getTypeCompte());
        account.setNumeroCompte(generateUniqueAccountNumber());
        account.setStatut(StatutCompte.ACTIF);

        Account saved = accountRepository.save(account);
        return mapToResponseDTO(saved);
    }

    public List<Account> getAccountsByUserId(Long userId) {
        return accountRepository.findAllByUserId(userId);
    }

    public Optional<Account> getAccountById(Long id) {
        return accountRepository.findById(id);
    }

    private String generateUniqueAccountNumber() {
        String number;
        do {
            number = "ACC-" + UUID.randomUUID().toString().substring(0, 8);
        } while (accountRepository.existsByNumeroCompte(number));
        return number;
    }

    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }

}

