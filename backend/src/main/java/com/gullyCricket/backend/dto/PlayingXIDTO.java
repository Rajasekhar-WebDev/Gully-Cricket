package com.gullyCricket.backend.dto;

import java.util.ArrayList;
import java.util.List;

public class PlayingXIDTO {
    private List<String> teamAPlayingXI = new ArrayList<>();
    private List<String> teamBPlayingXI = new ArrayList<>();
    private String openingStriker;
    private String openingNonStriker;
    private String openingBowler;

    public PlayingXIDTO() {}

    public List<String> getTeamAPlayingXI() { return teamAPlayingXI; }
    public void setTeamAPlayingXI(List<String> teamAPlayingXI) { this.teamAPlayingXI = teamAPlayingXI; }

    public List<String> getTeamBPlayingXI() { return teamBPlayingXI; }
    public void setTeamBPlayingXI(List<String> teamBPlayingXI) { this.teamBPlayingXI = teamBPlayingXI; }

    public String getOpeningStriker() { return openingStriker; }
    public void setOpeningStriker(String openingStriker) { this.openingStriker = openingStriker; }

    public String getOpeningNonStriker() { return openingNonStriker; }
    public void setOpeningNonStriker(String openingNonStriker) { this.openingNonStriker = openingNonStriker; }

    public String getOpeningBowler() { return openingBowler; }
    public void setOpeningBowler(String openingBowler) { this.openingBowler = openingBowler; }
}
