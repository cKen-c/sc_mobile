<?php

namespace App\Entity;

use App\Repository\CommentRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: CommentRepository::class)]
#[ORM\Table(name: 'comments')]
#[ORM\Index(columns: ['match_api_id'], name: 'idx_match_api_id')]
class Comment
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: 'text')]
    #[Assert\NotBlank]
    #[Assert\Length(min: 1, max: 1000)]
    private ?string $content = null;

    #[ORM\ManyToOne(inversedBy: 'comments')]
    #[ORM\JoinColumn(nullable: false)]
    private ?User $user = null;

    /** ID du match dans l'API football-data.org */
    #[ORM\Column(type: 'integer')]
    private ?int $matchApiId = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    #[ORM\Column(type: 'boolean')]
    private bool $edited = false;

    /** @var Collection<int, CommentLike> */
    #[ORM\OneToMany(targetEntity: CommentLike::class, mappedBy: 'comment', orphanRemoval: true)]
    private Collection $likes;

    #[ORM\ManyToOne(targetEntity: self::class, inversedBy: 'replies')]
    #[ORM\JoinColumn(nullable: true, onDelete: 'CASCADE')]
    private ?Comment $parent = null;

    /** @var Collection<int, Comment> */
    #[ORM\OneToMany(targetEntity: self::class, mappedBy: 'parent', orphanRemoval: true)]
    private Collection $replies;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
        $this->likes = new ArrayCollection();
        $this->replies = new ArrayCollection();
    }

    public function getId(): ?int { return $this->id; }

    public function getContent(): ?string { return $this->content; }
    public function setContent(string $content): static { $this->content = $content; return $this; }

    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $user): static { $this->user = $user; return $this; }

    public function getMatchApiId(): ?int { return $this->matchApiId; }
    public function setMatchApiId(int $matchApiId): static { $this->matchApiId = $matchApiId; return $this; }

    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    public function setCreatedAt(\DateTimeImmutable $createdAt): static { $this->createdAt = $createdAt; return $this; }

    public function getUpdatedAt(): ?\DateTimeImmutable { return $this->updatedAt; }
    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static { $this->updatedAt = $updatedAt; return $this; }

    public function isEdited(): bool { return $this->edited; }
    public function setEdited(bool $edited): static { $this->edited = $edited; return $this; }

    /** @return Collection<int, CommentLike> */
    public function getLikes(): Collection { return $this->likes; }

    public function getParent(): ?Comment { return $this->parent; }
    public function setParent(?Comment $parent): static { $this->parent = $parent; return $this; }

    /** @return Collection<int, Comment> */
    public function getReplies(): Collection { return $this->replies; }

    public function toArray(?User $currentUser = null): array
    {
        $likedByMe = false;
        if ($currentUser) {
            foreach ($this->likes as $like) {
                if ($like->getUser()->getId() === $currentUser->getId()) {
                    $likedByMe = true;
                    break;
                }
            }
        }

        // Trier les réponses par date croissante
        $replies = $this->replies->toArray();
        usort($replies, fn(Comment $a, Comment $b) => $a->getCreatedAt() <=> $b->getCreatedAt());

        return [
            'id' => $this->id,
            'content' => $this->content,
            'user' => [
                'id' => $this->user?->getId(),
                'username' => $this->user?->getUsername(),
            ],
            'matchApiId' => $this->matchApiId,
            'parentId' => $this->parent?->getId(),
            'parentUsername' => $this->parent?->getUser()?->getUsername(),
            'replies' => array_map(fn(Comment $r) => $r->toArray($currentUser), $replies),
            'likesCount' => $this->likes->count(),
            'likedByMe' => $likedByMe,
            'edited' => $this->edited,
            'createdAt' => $this->createdAt?->format('c'),
            'updatedAt' => $this->updatedAt?->format('c'),
        ];
    }
}
