package com.innovest.repository;

import com.innovest.domain.MandateInterest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MandateInterestRepository extends JpaRepository<MandateInterest, UUID> {
    List<MandateInterest> findByMandateId(UUID mandateId);
    List<MandateInterest> findByInnovatorId(UUID innovatorId);
    Optional<MandateInterest> findByMandateIdAndInnovatorId(UUID mandateId, UUID innovatorId);
}
