    package org.example.accountservice.entities;

    import jakarta.persistence.*;
    import lombok.*;
    import java.time.LocalDateTime;

    @Entity
    @Table(name = "accounts")
    @NoArgsConstructor
    @AllArgsConstructor
    public class Account {


        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id; // ID unique du compte

        @Column(nullable = false, unique = true)
        private String numeroCompte; // Numéro unique du compte (IBAN ou autre)

        @Column(nullable = false)
        private Long userId; // Clé étrangère vers User (dans AuthService)

        @Column(nullable = false, length = 3)
        private String devise; // MAD, USD, EUR

        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private TypeCompte typeCompte; // COURANT, EPARGNE, PROFESSIONNEL

        @Enumerated(EnumType.STRING)
        @Column(nullable = false)
        private StatutCompte statut; // ACTIF, BLOQUE, FERME

        @Column(nullable = false, updatable = false)
        private LocalDateTime dateOuverture; // Date de création du compte

        @PrePersist
        protected void onCreate() {
            this.dateOuverture = LocalDateTime.now(); // Auto-remplir la date d'ouverture
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


