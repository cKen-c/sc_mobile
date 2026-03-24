<?php

namespace App\Repository;

use App\Entity\CommentLike;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<CommentLike>
 */
class CommentLikeRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, CommentLike::class);
    }

    public function findByUserAndComment(int $userId, int $commentId): ?CommentLike
    {
        return $this->createQueryBuilder('cl')
            ->where('cl.user = :userId')
            ->andWhere('cl.comment = :commentId')
            ->setParameter('userId', $userId)
            ->setParameter('commentId', $commentId)
            ->getQuery()
            ->getOneOrNullResult();
    }
}
