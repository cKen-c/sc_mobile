<?php

namespace App\Entity;

use App\Repository\FootballMatchRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: FootballMatchRepository::class)]
#[ORM\Table(name: 'matches')]
class FootballMatch
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(nullable: true)]
    private ?int $externalId = null;

    #[ORM\Column(length: 150)]
    private ?string $homeTeam = null;

    #[ORM\Column(length: 150)]
    private ?string $awayTeam = null;

    #[ORM\Column(length: 500, nullable: true)]
    private ?string $homeTeamCrest = null;

    #[ORM\Column(length: 500, nullable: true)]
    private ?string $awayTeamCrest = null;

    #[ORM\Column(nullable: true)]
    private ?int $homeScore = null;

    #[ORM\Column(nullable: true)]
    private ?int $awayScore = null;

    #[ORM\Column(nullable: true)]
    private ?int $halfTimeHome = null;

    #[ORM\Column(nullable: true)]
    private ?int $halfTimeAway = null;

    #[ORM\Column(length: 30)]
    private ?string $status = null;

    #[ORM\Column(nullable: true)]
    private ?int $matchday = null;

    #[ORM\Column(type: 'datetime')]
    private ?\DateTimeInterface $utcDate = null;

    #[ORM\Column(length: 100, nullable: true)]
    private ?string $venue = null;

    #[ORM\ManyToOne(inversedBy: 'matches')]
    #[ORM\JoinColumn(nullable: false)]
    private ?League $league = null;

    #[ORM\Column(type: 'datetime_immutable')]
    private ?\DateTimeImmutable $createdAt = null;

    #[ORM\Column(type: 'datetime_immutable', nullable: true)]
    private ?\DateTimeImmutable $updatedAt = null;

    public function __construct()
    {
        $this->createdAt = new \DateTimeImmutable();
    }

    public function getId(): ?int { return $this->id; }

    public function getExternalId(): ?int { return $this->externalId; }
    public function setExternalId(?int $externalId): static { $this->externalId = $externalId; return $this; }

    public function getHomeTeam(): ?string { return $this->homeTeam; }
    public function setHomeTeam(string $homeTeam): static { $this->homeTeam = $homeTeam; return $this; }

    public function getAwayTeam(): ?string { return $this->awayTeam; }
    public function setAwayTeam(string $awayTeam): static { $this->awayTeam = $awayTeam; return $this; }

    public function getHomeTeamCrest(): ?string { return $this->homeTeamCrest; }
    public function setHomeTeamCrest(?string $homeTeamCrest): static { $this->homeTeamCrest = $homeTeamCrest; return $this; }

    public function getAwayTeamCrest(): ?string { return $this->awayTeamCrest; }
    public function setAwayTeamCrest(?string $awayTeamCrest): static { $this->awayTeamCrest = $awayTeamCrest; return $this; }

    public function getHomeScore(): ?int { return $this->homeScore; }
    public function setHomeScore(?int $homeScore): static { $this->homeScore = $homeScore; return $this; }

    public function getAwayScore(): ?int { return $this->awayScore; }
    public function setAwayScore(?int $awayScore): static { $this->awayScore = $awayScore; return $this; }

    public function getHalfTimeHome(): ?int { return $this->halfTimeHome; }
    public function setHalfTimeHome(?int $halfTimeHome): static { $this->halfTimeHome = $halfTimeHome; return $this; }

    public function getHalfTimeAway(): ?int { return $this->halfTimeAway; }
    public function setHalfTimeAway(?int $halfTimeAway): static { $this->halfTimeAway = $halfTimeAway; return $this; }

    public function getStatus(): ?string { return $this->status; }
    public function setStatus(string $status): static { $this->status = $status; return $this; }

    public function getMatchday(): ?int { return $this->matchday; }
    public function setMatchday(?int $matchday): static { $this->matchday = $matchday; return $this; }

    public function getUtcDate(): ?\DateTimeInterface { return $this->utcDate; }
    public function setUtcDate(\DateTimeInterface $utcDate): static { $this->utcDate = $utcDate; return $this; }

    public function getVenue(): ?string { return $this->venue; }
    public function setVenue(?string $venue): static { $this->venue = $venue; return $this; }

    public function getLeague(): ?League { return $this->league; }
    public function setLeague(?League $league): static { $this->league = $league; return $this; }

    public function getCreatedAt(): ?\DateTimeImmutable { return $this->createdAt; }
    public function setCreatedAt(\DateTimeImmutable $createdAt): static { $this->createdAt = $createdAt; return $this; }

    public function getUpdatedAt(): ?\DateTimeImmutable { return $this->updatedAt; }
    public function setUpdatedAt(?\DateTimeImmutable $updatedAt): static { $this->updatedAt = $updatedAt; return $this; }

    public function toArray(): array
    {
        return [
            'id' => $this->id,
            'externalId' => $this->externalId,
            'homeTeam' => $this->homeTeam,
            'awayTeam' => $this->awayTeam,
            'homeTeamCrest' => $this->homeTeamCrest,
            'awayTeamCrest' => $this->awayTeamCrest,
            'homeScore' => $this->homeScore,
            'awayScore' => $this->awayScore,
            'halfTimeHome' => $this->halfTimeHome,
            'halfTimeAway' => $this->halfTimeAway,
            'status' => $this->status,
            'matchday' => $this->matchday,
            'utcDate' => $this->utcDate?->format('c'),
            'venue' => $this->venue,
            'league' => $this->league?->toArray(),
            'createdAt' => $this->createdAt?->format('c'),
        ];
    }
}
