<?php

namespace App\Repository;

use App\Entity\Comment;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Comment>
 */
class CommentRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Comment::class);
    }

    /**
     * Retourne uniquement les commentaires racines (sans parent).
     * Les réponses sont chargées via la relation OneToMany.
     */
    public function findByMatch(int $matchApiId): array
    {
        return $this->createQueryBuilder('c')
            ->andWhere('c.matchApiId = :matchApiId')
            ->andWhere('c.parent IS NULL')
            ->setParameter('matchApiId', $matchApiId)
            ->orderBy('c.createdAt', 'DESC')
            ->getQuery()
            ->getResult();
    }
}
