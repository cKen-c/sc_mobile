<?php

namespace App\Controller;

use App\Entity\Comment;
use App\Entity\CommentLike;
use App\Entity\User;
use App\Repository\CommentRepository;
use App\Repository\CommentLikeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;

#[Route('/api/comments')]
class CommentController extends AbstractController
{
    #[Route('/match/{matchId}', name: 'api_comments_by_match', methods: ['GET'])]
    public function byMatch(int $matchId, CommentRepository $repo): JsonResponse
    {
        /** @var User|null $user */
        $user = $this->getUser();
        $comments = $repo->findByMatch($matchId);
        return $this->json(array_map(fn(Comment $c) => $c->toArray($user), $comments));
    }

    #[Route('', name: 'api_comments_create', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em, ValidatorInterface $validator): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();
        $data = json_decode($request->getContent(), true);

        if (!isset($data['content'], $data['matchId'])) {
            return $this->json(['error' => 'Contenu et matchId requis.'], 400);
        }

        $comment = new Comment();
        $comment->setContent($data['content']);
        $comment->setUser($user);
        $comment->setMatchApiId((int) $data['matchId']);

        // Gérer la réponse à un commentaire parent
        if (!empty($data['parentId'])) {
            $parent = $em->getRepository(Comment::class)->find($data['parentId']);
            if (!$parent || $parent->getMatchApiId() !== (int) $data['matchId']) {
                return $this->json(['error' => 'Commentaire parent invalide.'], 400);
            }
            // Pas de réponse imbriquée : on rattache toujours au commentaire racine
            $comment->setParent($parent->getParent() ?? $parent);
        }

        $errors = $validator->validate($comment);
        if (count($errors) > 0) {
            return $this->json(['error' => (string) $errors->get(0)->getMessage()], 400);
        }

        $em->persist($comment);
        $em->flush();

        return $this->json($comment->toArray($user), 201);
    }

    #[Route('/{id}', name: 'api_comments_update', methods: ['PUT'])]
    public function update(Comment $comment, Request $request, EntityManagerInterface $em, ValidatorInterface $validator): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        if ($comment->getUser()->getId() !== $user->getId() && !$this->isGranted('ROLE_ADMIN')) {
            return $this->json(['error' => 'Non autorisé.'], 403);
        }

        $data = json_decode($request->getContent(), true);
        if (isset($data['content'])) {
            $comment->setContent($data['content']);

            $errors = $validator->validate($comment);
            if (count($errors) > 0) {
                return $this->json(['error' => (string) $errors->get(0)->getMessage()], 400);
            }

            $comment->setUpdatedAt(new \DateTimeImmutable());
            $comment->setEdited(true);

            // Supprimer tous les likes quand un commentaire est modifié
            foreach ($comment->getLikes() as $like) {
                $em->remove($like);
            }
        }

        $em->flush();
        return $this->json($comment->toArray($user));
    }

    #[Route('/{id}', name: 'api_comments_delete', methods: ['DELETE'])]
    public function delete(Comment $comment, EntityManagerInterface $em): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        if ($comment->getUser()->getId() !== $user->getId() && !$this->isGranted('ROLE_ADMIN')) {
            return $this->json(['error' => 'Non autorisé.'], 403);
        }

        $em->remove($comment);
        $em->flush();

        return $this->json(['message' => 'Commentaire supprimé.']);
    }

    #[Route('/{id}/like', name: 'api_comments_toggle_like', methods: ['POST'])]
    public function toggleLike(Comment $comment, EntityManagerInterface $em, CommentLikeRepository $likeRepo): JsonResponse
    {
        /** @var User $user */
        $user = $this->getUser();

        $existingLike = $likeRepo->findByUserAndComment($user->getId(), $comment->getId());

        if ($existingLike) {
            $em->remove($existingLike);
        } else {
            $like = new CommentLike();
            $like->setUser($user);
            $like->setComment($comment);
            $em->persist($like);
        }

        $em->flush();
        // Refresh to get updated likes count
        $em->refresh($comment);

        return $this->json($comment->toArray($user));
    }
}
