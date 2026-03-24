<?php

namespace App\Controller;

use App\Service\FootballApiService;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/football')]
class FootballController extends AbstractController
{
    public function __construct(private FootballApiService $footballApi) {}

    #[Route('/competitions', name: 'api_football_competitions', methods: ['GET'])]
    public function competitions(): JsonResponse
    {
        try {
            $data = $this->footballApi->getCompetitions();
            return $this->json($data);
        } catch (\Throwable $e) {
            return $this->json(['error' => 'Service football indisponible.'], 502);
        }
    }

    #[Route('/competitions/{code}', name: 'api_football_competition', methods: ['GET'])]
    public function competition(string $code): JsonResponse
    {
        try {
            $data = $this->footballApi->getCompetition($code);
            return $this->json($data);
        } catch (\Throwable $e) {
            return $this->json(['error' => 'Service football indisponible.'], 502);
        }
    }

    #[Route('/competitions/{code}/standings', name: 'api_football_standings', methods: ['GET'])]
    public function standings(string $code, Request $request): JsonResponse
    {
        try {
            $matchday = $request->query->getInt('matchday') ?: null;
            $season = $request->query->getInt('season') ?: null;
            $data = $this->footballApi->getStandings($code, $matchday, $season);
            return $this->json($data);
        } catch (\Throwable $e) {
            return $this->json(['error' => 'Service football indisponible.'], 502);
        }
    }

    #[Route('/competitions/{code}/matches', name: 'api_football_competition_matches', methods: ['GET'])]
    public function competitionMatches(string $code, Request $request): JsonResponse
    {
        try {
            $filters = [];
            if ($request->query->has('dateFrom')) $filters['dateFrom'] = $request->query->get('dateFrom');
            if ($request->query->has('dateTo')) $filters['dateTo'] = $request->query->get('dateTo');
            if ($request->query->has('status')) $filters['status'] = $request->query->get('status');
            if ($request->query->has('matchday')) $filters['matchday'] = $request->query->get('matchday');
            if ($request->query->has('season')) $filters['season'] = $request->query->get('season');

            $data = $this->footballApi->getCompetitionMatches($code, $filters);
            return $this->json($data);
        } catch (\Throwable $e) {
            return $this->json(['error' => 'Service football indisponible.'], 502);
        }
    }

    #[Route('/competitions/{code}/teams', name: 'api_football_teams', methods: ['GET'])]
    public function teams(string $code, Request $request): JsonResponse
    {
        try {
            $season = $request->query->getInt('season') ?: null;
            $data = $this->footballApi->getCompetitionTeams($code, $season);
            return $this->json($data);
        } catch (\Throwable $e) {
            return $this->json(['error' => 'Service football indisponible.'], 502);
        }
    }

    #[Route('/competitions/{code}/scorers', name: 'api_football_scorers', methods: ['GET'])]
    public function scorers(string $code, Request $request): JsonResponse
    {
        try {
            $limit = $request->query->getInt('limit', 10);
            $season = $request->query->getInt('season') ?: null;
            $data = $this->footballApi->getScorers($code, $limit, $season);
            return $this->json($data);
        } catch (\Throwable $e) {
            return $this->json(['error' => 'Service football indisponible.'], 502);
        }
    }

    #[Route('/matches', name: 'api_football_today_matches', methods: ['GET'])]
    public function todayMatches(Request $request): JsonResponse
    {
        try {
            $competitions = $request->query->get('competitions');
            $data = $this->footballApi->getTodayMatches($competitions);
            return $this->json($data);
        } catch (\Throwable $e) {
            return $this->json(['error' => 'Service football indisponible.'], 502);
        }
    }

    #[Route('/matches/{id}', name: 'api_football_match', methods: ['GET'])]
    public function match(int $id): JsonResponse
    {
        try {
            $data = $this->footballApi->getMatch($id);
            return $this->json($data);
        } catch (\Throwable $e) {
            return $this->json(['error' => 'Service football indisponible.'], 502);
        }
    }

    #[Route('/matches/{id}/head2head', name: 'api_football_h2h', methods: ['GET'])]
    public function head2head(int $id, Request $request): JsonResponse
    {
        try {
            $limit = $request->query->getInt('limit', 10);
            $data = $this->footballApi->getHead2Head($id, $limit);
            return $this->json($data);
        } catch (\Throwable $e) {
            return $this->json(['error' => 'Service football indisponible.'], 502);
        }
    }

    #[Route('/teams/{id}', name: 'api_football_team', methods: ['GET'])]
    public function team(int $id): JsonResponse
    {
        try {
            $data = $this->footballApi->getTeam($id);
            return $this->json($data);
        } catch (\Throwable $e) {
            return $this->json(['error' => 'Service football indisponible.'], 502);
        }
    }

    #[Route('/teams/{id}/matches', name: 'api_football_team_matches', methods: ['GET'])]
    public function teamMatches(int $id, Request $request): JsonResponse
    {
        try {
            $filters = [];
            if ($request->query->has('status')) $filters['status'] = $request->query->get('status');
            if ($request->query->has('season')) $filters['season'] = $request->query->get('season');
            if ($request->query->has('limit')) $filters['limit'] = $request->query->get('limit');

            $data = $this->footballApi->getTeamMatches($id, $filters);
            return $this->json($data);
        } catch (\Throwable $e) {
            return $this->json(['error' => 'Service football indisponible.'], 502);
        }
    }

    #[Route('/persons/{id}', name: 'api_football_person', methods: ['GET'])]
    public function person(int $id): JsonResponse
    {
        try {
            $data = $this->footballApi->getPerson($id);
            return $this->json($data);
        } catch (\Throwable $e) {
            return $this->json(['error' => 'Service football indisponible.'], 502);
        }
    }
}
