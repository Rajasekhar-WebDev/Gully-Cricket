package com.gullyCricket.backend.model;

public class Extras {
    private int wides = 0;
    private int noBalls = 0;
    private int byes = 0;
    private int legByes = 0;
    private int penalty = 0;

    public Extras() {}

    public int getTotal() {
        return wides + noBalls + byes + legByes + penalty;
    }

    public int getWides() { return wides; }
    public void setWides(int wides) { this.wides = wides; }

    public int getNoBalls() { return noBalls; }
    public void setNoBalls(int noBalls) { this.noBalls = noBalls; }

    public int getByes() { return byes; }
    public void setByes(int byes) { this.byes = byes; }

    public int getLegByes() { return legByes; }
    public void setLegByes(int legByes) { this.legByes = legByes; }

    public int getPenalty() { return penalty; }
    public void setPenalty(int penalty) { this.penalty = penalty; }
}
