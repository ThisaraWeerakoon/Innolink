package com.innovest.repository;

import com.innovest.domain.Deal;
import com.innovest.domain.DealStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DealRepository extends JpaRepository<Deal, UUID> {
    List<Deal> findByStatus(DealStatus status);
    List<Deal> findByInnovatorId(UUID innovatorId);
    List<Deal> findByInnovatorIdAndStatus(UUID innovatorId, DealStatus status);
}
