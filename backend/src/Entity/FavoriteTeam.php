<?php

namespace App\Entity;

use App\Repository\FavoriteTeamRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: FavoriteTeamRepository::class)]
#[ORM\Table(name: 'favorite_teams')]
#[ORM\UniqueConstraint(name: 'unique_user_team', columns: ['user_id', 'team_api_id'])]
class FavoriteTeam
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\ManyToOne]
    #[ORM\JoinColumn(nullable: false, onDelete: 'CASCADE')]
    private ?User $user = null;

    #[ORM\Column(type: 'integer')]
    private ?int $teamApiId = null;

    #[ORM\Column(length: 255)]
    private ?string $teamName = null;

    #[ORM\Column(length: 10, nullable: true)]
    private ?string $teamTla = null;

    #[ORM\Column(length: 500, nullable: true)]
    private ?string $teamCrest = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private ?\DateTimeImmutable $createdAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getUser(): ?User { return $this->user; }
    public function setUser(?User $user): static { $this->user = $user; return $this; }

    public function getTeamApiId(): ?int { return $this->teamApiId; }
    public function setTeamApiId(int $teamApiId): static { $this->teamApiId = $teamApiId; return $this; }

    public function getTeamName(): ?string { return $this->teamName; }
    public function setTeamName(string $teamName): static { $this->teamName = $teamName; return $this; }

    public function getTeamTla(): ?string { return $this->teamTla; }
    public function setTeamTla(?string $teamTla): static { $this->teamTla = $teamTla; return $this; }

    public function getTeamCrest(): ?string { return $this->teamCrest; }
    public function setTeamCrest(?string $teamCrest): static { $this->teamCrest = $teamCrest; return $this; }

    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'teamApiId' => $this->teamApiId,
            'teamName' => $this->teamName,
            'teamTla' => $this->teamTla,
            'teamCrest' => $this->teamCrest,
            'createdAt' => $this->createdAt?->format('c'),
        ];
    }
}
