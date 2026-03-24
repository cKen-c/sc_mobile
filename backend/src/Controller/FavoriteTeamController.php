<?php

namespace App\Controller;

use App\Entity\FavoriteTeam;
use App\Entity\User;
use App\Repository\FavoriteTeamRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/favorites')]
class FavoriteTeamController extends AbstractController
{
    #[Route('', name: 'api_favorites_list', methods: ['GET'])]
    public function list(FavoriteTeamRepository $repo): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $favorites = $repo->findByUser($user->getId());
        return $this->json(array_map(fn(FavoriteTeam $f) => $f->toArray(), $favorites));
    }

    #[Route('/ids', name: 'api_favorites_ids', methods: ['GET'])]
    public function ids(FavoriteTeamRepository $repo): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $favorites = $repo->findByUser($user->getId());
        return $this->json(array_map(fn(FavoriteTeam $f) => $f->getTeamApiId(), $favorites));
    }

    #[Route('/toggle', name: 'api_favorites_toggle', methods: ['POST'])]
    public function toggle(Request $request, EntityManagerInterface $em, FavoriteTeamRepository $repo): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        if (!isset($data['teamApiId'], $data['teamName'])) {
            return $this->json(['error' => 'teamApiId et teamName requis.'], 400);
        }

        $existing = $repo->findByUserAndTeam($user->getId(), (int) $data['teamApiId']);

        if ($existing) {
            $em->remove($existing);
            $em->flush();
            return $this->json(['favorited' => false]);
        }

        $fav = new FavoriteTeam();
        $fav->setUser($user);
        $fav->setTeamApiId((int) $data['teamApiId']);
        $fav->setTeamName($data['teamName']);
        $fav->setTeamTla($data['teamTla'] ?? null);
        $fav->setTeamCrest($data['teamCrest'] ?? null);

        $em->persist($fav);
        $em->flush();

        return $this->json(['favorited' => true, 'favorite' => $fav->toArray()], 201);
    }
}
