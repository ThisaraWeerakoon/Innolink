package com.innovest.repository;

import com.innovest.domain.AccessRequest;
import com.innovest.domain.RequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AccessRequestRepository extends JpaRepository<AccessRequest, UUID> {
    Optional<AccessRequest> findByDealIdAndInvestorId(UUID dealId, UUID investorId);
    List<AccessRequest> findByDealId(UUID dealId);
    List<AccessRequest> findByInvestorId(UUID investorId);
    List<AccessRequest> findByDealInnovatorId(UUID innovatorId);
}
