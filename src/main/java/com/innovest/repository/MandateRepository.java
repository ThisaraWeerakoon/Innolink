package com.innovest.repository;

import com.innovest.domain.Mandate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface MandateRepository extends JpaRepository<Mandate, UUID> {
}
