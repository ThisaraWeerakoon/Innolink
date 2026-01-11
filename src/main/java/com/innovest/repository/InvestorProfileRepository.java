package com.innovest.repository;

import com.innovest.domain.InvestorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.UUID;

public interface InvestorProfileRepository extends JpaRepository<InvestorProfile, UUID> {
}
