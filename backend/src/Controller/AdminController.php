<?php

namespace App\Controller;

use App\Entity\Comment;
use App\Entity\FootballMatch;
use App\Entity\League;
use App\Entity\Sport;
use App\Entity\User;
use App\Service\FootballSyncService;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/api/admin')]
class AdminController extends AbstractController
{
    // ──── Dashboard ────

    #[Route('/dashboard', name: 'api_admin_dashboard', methods: ['GET'])]
    public function dashboard(EntityManagerInterface $em): JsonResponse
    {
        return $this->json([
            'users' => $em->getRepository(User::class)->count([]),
            'sports' => $em->getRepository(Sport::class)->count([]),
            'leagues' => $em->getRepository(League::class)->count([]),
            'matches' => $em->getRepository(FootballMatch::class)->count([]),
            'comments' => $em->getRepository(Comment::class)->count([]),
        ]);
    }

    // ──── Sports CRUD ────

    #[Route('/sports', name: 'api_admin_sports_list', methods: ['GET'])]
    public function listSports(EntityManagerInterface $em): JsonResponse
    {
        $sports = $em->getRepository(Sport::class)->findAll();
        return $this->json(array_map(fn(Sport $s) => $s->toArray(), $sports));
    }

    #[Route('/sports', name: 'api_admin_sports_create', methods: ['POST'])]
    public function createSport(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!$data || empty($data['name']) || empty($data['slug'])) {
            return $this->json(['error' => 'Nom et slug requis.'], 400);
        }
        $sport = new Sport();
        $sport->setName($data['name']);
        $sport->setSlug($data['slug']);
        $sport->setIcon($data['icon'] ?? null);

        $em->persist($sport);
        $em->flush();

        return $this->json($sport->toArray(), 201);
    }

    #[Route('/sports/{id}', name: 'api_admin_sports_update', methods: ['PUT'])]
    public function updateSport(Sport $sport, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return $this->json(['error' => 'JSON invalide.'], 400);
        }
        if (isset($data['name'])) $sport->setName($data['name']);
        if (isset($data['slug'])) $sport->setSlug($data['slug']);
        if (isset($data['icon'])) $sport->setIcon($data['icon']);

        $em->flush();
        return $this->json($sport->toArray());
    }

    #[Route('/sports/{id}', name: 'api_admin_sports_delete', methods: ['DELETE'])]
    public function deleteSport(Sport $sport, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($sport);
        $em->flush();
        return $this->json(['message' => 'Sport supprimé.']);
    }

    // ──── Leagues CRUD ────

    #[Route('/leagues', name: 'api_admin_leagues_list', methods: ['GET'])]
    public function listLeagues(EntityManagerInterface $em): JsonResponse
    {
        $leagues = $em->getRepository(League::class)->findAll();
        return $this->json(array_map(fn(League $l) => $l->toArray(), $leagues));
    }

    #[Route('/leagues', name: 'api_admin_leagues_create', methods: ['POST'])]
    public function createLeague(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!$data || empty($data['name']) || empty($data['code'])) {
            return $this->json(['error' => 'Nom et code requis.'], 400);
        }
        $sport = $em->getRepository(Sport::class)->find($data['sportId'] ?? 0);
        if (!$sport) {
            return $this->json(['error' => 'Sport non trouvé.'], 404);
        }

        $league = new League();
        $league->setName($data['name'] ?? '');
        $league->setCode($data['code'] ?? '');
        $league->setCountry($data['country'] ?? null);
        $league->setEmblem($data['emblem'] ?? null);
        $league->setExternalId($data['externalId'] ?? null);
        $league->setSport($sport);

        $em->persist($league);
        $em->flush();

        return $this->json($league->toArray(), 201);
    }

    #[Route('/leagues/{id}', name: 'api_admin_leagues_update', methods: ['PUT'])]
    public function updateLeague(League $league, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return $this->json(['error' => 'JSON invalide.'], 400);
        }
        if (isset($data['name'])) $league->setName($data['name']);
        if (isset($data['code'])) $league->setCode($data['code']);
        if (isset($data['country'])) $league->setCountry($data['country']);
        if (isset($data['emblem'])) $league->setEmblem($data['emblem']);

        $em->flush();
        return $this->json($league->toArray());
    }

    #[Route('/leagues/{id}', name: 'api_admin_leagues_delete', methods: ['DELETE'])]
    public function deleteLeague(League $league, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($league);
        $em->flush();
        return $this->json(['message' => 'Ligue supprimée.']);
    }

    // ──── Matches CRUD ────

    #[Route('/matches', name: 'api_admin_matches_list', methods: ['GET'])]
    public function listMatches(EntityManagerInterface $em): JsonResponse
    {
        $matches = $em->getRepository(FootballMatch::class)->findBy([], ['utcDate' => 'DESC'], 50);
        return $this->json(array_map(fn(FootballMatch $m) => $m->toArray(), $matches));
    }

    #[Route('/matches/{id}', name: 'api_admin_matches_update', methods: ['PUT'])]
    public function updateMatch(FootballMatch $match, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return $this->json(['error' => 'JSON invalide.'], 400);
        }
        if (isset($data['homeScore'])) $match->setHomeScore($data['homeScore']);
        if (isset($data['awayScore'])) $match->setAwayScore($data['awayScore']);
        if (isset($data['status'])) $match->setStatus($data['status']);
        $match->setUpdatedAt(new \DateTimeImmutable());

        $em->flush();
        return $this->json($match->toArray());
    }

    #[Route('/matches/{id}', name: 'api_admin_matches_delete', methods: ['DELETE'])]
    public function deleteMatch(FootballMatch $match, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($match);
        $em->flush();
        return $this->json(['message' => 'Match supprimé.']);
    }

    // ──── Users Management ────

    #[Route('/users', name: 'api_admin_users_list', methods: ['GET'])]
    public function listUsers(EntityManagerInterface $em): JsonResponse
    {
        $users = $em->getRepository(User::class)->findAll();
        return $this->json(array_map(fn(User $u) => $u->toArrayAdmin(), $users));
    }

    #[Route('/users/{id}', name: 'api_admin_users_delete', methods: ['DELETE'])]
    public function deleteUser(User $user, EntityManagerInterface $em): JsonResponse
    {
        if ($user->getId() === $this->getUser()->getId()) {
            return $this->json(['error' => 'Vous ne pouvez pas supprimer votre propre compte admin.'], 403);
        }

        $em->remove($user);
        $em->flush();
        return $this->json(['message' => 'Utilisateur supprimé.']);
    }

    // ──── Comments Moderation ────

    #[Route('/comments', name: 'api_admin_comments_list', methods: ['GET'])]
    public function listComments(EntityManagerInterface $em): JsonResponse
    {
        $comments = $em->getRepository(Comment::class)->findBy([], ['createdAt' => 'DESC'], 50);
        return $this->json(array_map(fn(Comment $c) => $c->toArray(), $comments));
    }

    #[Route('/comments/{id}', name: 'api_admin_comments_delete', methods: ['DELETE'])]
    public function deleteComment(Comment $comment, EntityManagerInterface $em): JsonResponse
    {
        $em->remove($comment);
        $em->flush();
        return $this->json(['message' => 'Commentaire supprimé.']);
    }

    // ──── API Sync ────

    #[Route('/sync', name: 'api_admin_sync', methods: ['POST'])]
    public function sync(Request $request, FootballSyncService $syncService): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        if (!$data) {
            return $this->json(['error' => 'Données invalides.'], 400);
        }
        $code = $data['competition'] ?? null;
        $dateFrom = $data['dateFrom'] ?? null;
        $dateTo = $data['dateTo'] ?? null;

        $count = $syncService->syncMatches($code, $dateFrom, $dateTo);

        return $this->json([
            'message' => "Synchronisation terminée. $count matchs traités.",
            'count' => $count,
        ]);
    }
}
