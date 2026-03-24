<?php

namespace App\Controller;

use App\Entity\FootballMatch;
use App\Repository\FootballMatchRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/matches')]
class MatchController extends AbstractController
{
    #[Route('', name: 'api_matches_list', methods: ['GET'])]
    public function index(FootballMatchRepository $repo, Request $request): JsonResponse
    {
        $leagueId = $request->query->getInt('league');
        $status = $request->query->get('status');

        if ($leagueId) {
            $matches = $repo->findByLeague($leagueId, $status);
        } elseif ($status === 'LIVE') {
            $matches = $repo->findLiveMatches();
        } else {
            $matches = $repo->findTodayMatches();
        }

        return $this->json(array_map(fn(FootballMatch $m) => $m->toArray(), $matches));
    }

    #[Route('/live', name: 'api_matches_live', methods: ['GET'])]
    public function live(FootballMatchRepository $repo): JsonResponse
    {
        $matches = $repo->findLiveMatches();
        return $this->json(array_map(fn(FootballMatch $m) => $m->toArray(), $matches));
    }

    #[Route('/{id}', name: 'api_matches_show', methods: ['GET'])]
    public function show(FootballMatch $match): JsonResponse
    {
        return $this->json($match->toArray());
    }
}
