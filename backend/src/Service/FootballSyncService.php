<?php

namespace App\Service;

use App\Entity\FootballMatch;
use App\Entity\League;
use App\Repository\FootballMatchRepository;
use App\Repository\LeagueRepository;
use Doctrine\ORM\EntityManagerInterface;

class FootballSyncService
{
    // Ligues supportées : Premier League, La Liga, Ligue 1
    private const SUPPORTED_COMPETITIONS = ['PL', 'PD', 'FL1'];

    public function __construct(
        private FootballApiService $footballApi,
        private EntityManagerInterface $em,
        private LeagueRepository $leagueRepo,
        private FootballMatchRepository $matchRepo,
    ) {}

    public function syncMatches(?string $competitionCode = null, ?string $dateFrom = null, ?string $dateTo = null): int
    {
        $codes = $competitionCode ? [$competitionCode] : self::SUPPORTED_COMPETITIONS;
        $total = 0;

        foreach ($codes as $code) {
            $league = $this->leagueRepo->findOneBy(['code' => $code]);
            if (!$league) continue;

            $filters = [];
            if ($dateFrom) $filters['dateFrom'] = $dateFrom;
            if ($dateTo) $filters['dateTo'] = $dateTo;

            try {
                $data = $this->footballApi->getCompetitionMatches($code, $filters);
            } catch (\Exception $e) {
                continue;
            }

            if (!isset($data['matches'])) continue;

            foreach ($data['matches'] as $matchData) {
                // Vérification de la date : ignorer si la date est absente ou invalide
                if (empty($matchData['utcDate'])) {
                    continue;
                }
                try {
                    $matchDate = new \DateTime($matchData['utcDate']);
                } catch (\Exception $e) {
                    continue;
                }

                $match = $this->matchRepo->findByExternalId($matchData['id']);

                if (!$match) {
                    $match = new FootballMatch();
                    $match->setExternalId($matchData['id']);
                    $match->setLeague($league);
                }

                $match->setHomeTeam($matchData['homeTeam']['name'] ?? 'TBD');
                $match->setAwayTeam($matchData['awayTeam']['name'] ?? 'TBD');
                $match->setHomeTeamCrest($matchData['homeTeam']['crest'] ?? null);
                $match->setAwayTeamCrest($matchData['awayTeam']['crest'] ?? null);
                $match->setHomeScore($matchData['score']['fullTime']['home'] ?? null);
                $match->setAwayScore($matchData['score']['fullTime']['away'] ?? null);
                $match->setHalfTimeHome($matchData['score']['halfTime']['home'] ?? null);
                $match->setHalfTimeAway($matchData['score']['halfTime']['away'] ?? null);
                $match->setStatus($matchData['status']);
                $match->setMatchday($matchData['matchday'] ?? null);
                $match->setUtcDate($matchDate);
                $match->setUpdatedAt(new \DateTimeImmutable());

                $this->em->persist($match);
                $total++;
            }
        }

        $this->em->flush();
        return $total;
    }
}
