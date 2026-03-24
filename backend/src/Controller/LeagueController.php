<?php

namespace App\Controller;

use App\Entity\League;
use App\Repository\LeagueRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/leagues')]
class LeagueController extends AbstractController
{
    #[Route('', name: 'api_leagues_list', methods: ['GET'])]
    public function index(LeagueRepository $repo): JsonResponse
    {
        $leagues = $repo->findAll();
        return $this->json(array_map(fn(League $l) => $l->toArray(), $leagues));
    }

    #[Route('/{id}', name: 'api_leagues_show', methods: ['GET'])]
    public function show(League $league): JsonResponse
    {
        return $this->json($league->toArray());
    }
}
