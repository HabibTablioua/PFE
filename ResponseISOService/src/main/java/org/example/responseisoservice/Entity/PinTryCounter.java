package org.example.responseisoservice.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class PinTryCounter {
    @Id
    private String pan;
    private int tries;
    private boolean blocked;

    public String getPan() { return pan; }
    public void setPan(String pan) { this.pan = pan; }
    public int getTries() { return tries; }
    public void setTries(int tries) { this.tries = tries; }
    public boolean isBlocked() { return blocked; }
    public void setBlocked(boolean blocked) { this.blocked = blocked; }
} 