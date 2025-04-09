package org.example.accountservice.DTO;

import lombok.*;

import org.example.accountservice.entities.StatutCompte;
import org.example.accountservice.entities.TypeCompte;

import java.time.LocalDateTime;


@Getter
@Setter
@NoArgsConstructor
public class AccountRequestDTO {


    private Long id;
    private Long userId;
    private String numeroCompte;
    private String devise;
    private TypeCompte typeCompte;
    private StatutCompte statut;
    private LocalDateTime dateOuverture;

    public AccountRequestDTO(Long id, String numeroCompte, Long userId, String devise, TypeCompte typeCompte, StatutCompte statut, LocalDateTime dateOuverture) {
        this.id = id;
        this.numeroCompte = numeroCompte;
        this.userId = userId;
        this.devise = devise;
        this.typeCompte = typeCompte;
        this.statut = statut;
        this.dateOuverture = dateOuverture;
    }


    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getDevise() {
        return devise;
    }

    public void setDevise(String devise) {
        this.devise = devise;
    }

    public TypeCompte getTypeCompte() {
        return typeCompte;
    }

    public void setTypeCompte(TypeCompte typeCompte) {
        this.typeCompte = typeCompte;
    }

    public String getNumeroCompte() {
        return numeroCompte;
    }

    public void setNumeroCompte(String numeroCompte) {
        this.numeroCompte = numeroCompte;
    }

    public StatutCompte getStatut() {
        return statut;
    }

    public void setStatut(StatutCompte statut) {
        this.statut = statut;
    }

    public LocalDateTime getDateOuverture() {
        return dateOuverture;
    }

    public void setDateOuverture(LocalDateTime dateOuverture) {
        this.dateOuverture = dateOuverture;
    }



}


