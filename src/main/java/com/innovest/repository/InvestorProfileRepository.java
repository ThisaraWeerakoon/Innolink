package com.innovest.repository;

import com.innovest.domain.InvestorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface InvestorProfileRepository extends JpaRepository<InvestorProfile, UUID> {
}
