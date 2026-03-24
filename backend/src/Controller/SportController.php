<?php

namespace App\Controller;

use App\Entity\Sport;
use App\Repository\SportRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/sports')]
class SportController extends AbstractController
{
    #[Route('', name: 'api_sports_list', methods: ['GET'])]
    public function index(SportRepository $repo): JsonResponse
    {
        $sports = $repo->findAll();
        return $this->json(array_map(fn(Sport $s) => $s->toArray(), $sports));
    }

    #[Route('/{id}', name: 'api_sports_show', methods: ['GET'])]
    public function show(Sport $sport): JsonResponse
    {
        $data = $sport->toArray();
        $data['leagues'] = array_map(fn($l) => $l->toArray(), $sport->getLeagues()->toArray());
        return $this->json($data);
    }
}
