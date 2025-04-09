package org.example.accountservice.repository;



import org.example.accountservice.entities.Account;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AccountRepository extends JpaRepository<Account, Long> {
    List<Account> findAllByUserId(Long userId);
    boolean existsByNumeroCompte(String numeroCompte);
    boolean existsByUserId(Long userId); // Ajouter cette méthode
}

