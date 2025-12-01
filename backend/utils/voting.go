package utils

import (
	"time"

	"github.com/zach-short/final-web-programming/models"
)

func CalculateVoteTally(motion *models.Motion, committee *models.Committee) *models.VoteTally {
	ayeCount := 0
	nayCount := 0
	abstainCount := 0

	for _, vote := range motion.Votes {
		switch vote.Result {
		case models.VoteAye:
			ayeCount++
		case models.VoteNay:
			nayCount++
		case models.VoteAbstain:
			abstainCount++
		}
	}

	totalEligible := len(committee.MemberIDs)
	quorumRequired := (totalEligible * committee.VotingRules.QuorumPercentage) / 100
	totalVoted := ayeCount + nayCount + abstainCount
	quorumMet := totalVoted >= quorumRequired

	tally := &models.VoteTally{
		AyeCount:      ayeCount,
		NayCount:      nayCount,
		AbstainCount:  abstainCount,
		TotalEligible: totalEligible,
		QuorumMet:     quorumMet,
	}

	return tally
}

func CheckMotionResolution(motion *models.Motion, tally *models.VoteTally, committee *models.Committee) (resolved bool, passed bool) {
	if motion.RequiresQuorum && !tally.QuorumMet {
		return false, false
	}

	allVoted := (tally.AyeCount + tally.NayCount + tally.AbstainCount) == tally.TotalEligible

	if motion.VotingEndsAt != nil && time.Now().After(*motion.VotingEndsAt) {
		return true, CalculatePassed(tally, motion.VoteThreshold)
	}

	if allVoted {
		return true, CalculatePassed(tally, motion.VoteThreshold)
	}

	canStillPass := CanMotionStillPass(tally, motion.VoteThreshold)
	canStillFail := CanMotionStillFail(tally, motion.VoteThreshold)

	if !canStillPass {
		return true, false
	}
	if !canStillFail {
		return true, true
	}

	return false, false
}

func CalculatePassed(tally *models.VoteTally, threshold models.VoteThreshold) bool {
	totalVotes := tally.AyeCount + tally.NayCount

	if totalVotes == 0 {
		return false
	}

	switch threshold {
	case models.VoteThresholdSimpleMajority:
		return float64(tally.AyeCount)/float64(totalVotes) > 0.5
	case models.VoteThresholdTwoThirds:
		return float64(tally.AyeCount)/float64(totalVotes) >= 0.6667
	case models.VoteThresholdUnanimous:
		return tally.NayCount == 0 && tally.AyeCount > 0
	default:
		return false
	}
}

func CanMotionStillPass(tally *models.VoteTally, threshold models.VoteThreshold) bool {
	remainingVotes := tally.TotalEligible - (tally.AyeCount + tally.NayCount + tally.AbstainCount)
	maxPossibleAyes := tally.AyeCount + remainingVotes
	totalVotesIfAllVote := tally.TotalEligible - tally.AbstainCount

	if totalVotesIfAllVote == 0 {
		return false
	}

	switch threshold {
	case models.VoteThresholdSimpleMajority:
		return float64(maxPossibleAyes)/float64(totalVotesIfAllVote) > 0.5
	case models.VoteThresholdTwoThirds:
		return float64(maxPossibleAyes)/float64(totalVotesIfAllVote) >= 0.6667
	case models.VoteThresholdUnanimous:
		return tally.NayCount == 0
	default:
		return false
	}
}

func CanMotionStillFail(tally *models.VoteTally, threshold models.VoteThreshold) bool {
	remainingVotes := tally.TotalEligible - (tally.AyeCount + tally.NayCount + tally.AbstainCount)
	maxPossibleNays := tally.NayCount + remainingVotes
	minPossibleTotalVotes := tally.AyeCount + tally.NayCount

	if minPossibleTotalVotes == 0 {
		return true
	}

	switch threshold {
	case models.VoteThresholdSimpleMajority:
		wouldPassWithCurrentAyes := float64(tally.AyeCount)/float64(minPossibleTotalVotes+remainingVotes) > 0.5
		return !wouldPassWithCurrentAyes || maxPossibleNays > tally.AyeCount
	case models.VoteThresholdTwoThirds:
		totalWithAllVoting := tally.AyeCount + maxPossibleNays
		return float64(tally.AyeCount)/float64(totalWithAllVoting) < 0.6667
	case models.VoteThresholdUnanimous:
		return tally.NayCount > 0 || remainingVotes > 0
	default:
		return true
	}
}
